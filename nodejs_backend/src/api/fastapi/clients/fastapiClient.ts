import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { logger } from "../../../shared/utils/logger.util";
import { envConfig } from "../../../app/config/env.config";
import { FastApiBusinessException } from "../../../shared/exceptions/fastApiBusiness.exception";
import { ERROR_CODES } from "../../../shared/constants/error.constant";

// ==========================================
// 1. FastAPI 错误码常量 (与 Python 保持一致)
// ==========================================
const FASTAPI_ERROR_CODES = {
  // 成功码
  SUCCESS: 20000,

  // 客户端错误 (400xx)
  VALIDATION_ERROR: 40001,
  NOT_FOUND: 40004,
  FILE_READ_ERROR: 40010,
  FILE_DECODE_ERROR: 40011,
  FILE_FORMAT_ERROR: 40012,
  DATA_EMPTY_ERROR: 40013,
  DATA_SCHEMA_ERROR: 40014,
  DATA_PARSE_ERROR: 40015,

  // 服务端错误 (500xx)
  INTERNAL_ERROR: 50000,
  COMPUTE_FAILED: 50010,
  EXTERNAL_SERVICE_ERROR: 50020,
  INFRASTRUCTURE_ERROR: 50030,
} as const;

// 类型增强
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
    _maxRetry?: number;
  }
}

/**
 * FastAPI 外部服务客户端
 * 职责：封装与 Python 分析服务的所有 HTTP 交互
 * 特性：自动重试、统一错误处理、日志记录
 */
class FastApiClient {
  private client: AxiosInstance;
  private readonly MAX_RETRY = 3;

  constructor() {
    this.client = axios.create({
      baseURL: envConfig.clients.fastApi.baseUrl,
      timeout: envConfig.clients.fastApi.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // ========== 请求拦截器 (保持不变) ==========
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        config._retryCount = config._retryCount || 0;
        // @ts-ignore
        config._maxRetry = this.MAX_RETRY;

        logger.info(
          `🚀 [FastAPI Req] [Retry:${config._retryCount}/${
            this.MAX_RETRY
          }] ${config.method?.toUpperCase()} ${config.url}`,
        );

        return config;
      },
      (error: AxiosError) => {
        logger.error("❌ [FastAPI Req Error]", error);
        return Promise.reject(error);
      },
    );

    // ========== 响应拦截器 (修复核心) ==========
    this.client.interceptors.response.use(
      // A. 成功响应处理 (2xx)
      (response: AxiosResponse) => {
        const payload = response.data;

        // 1. 结构完整性校验
        if (!payload || typeof payload !== "object") {
          logger.error("❌ [FastAPI] Invalid response format:", payload);
          throw new FastApiBusinessException(
            "Invalid response format from Analysis Engine",
            ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          );
        }

        // 2. 🟢 兼容性状态校验 (关键修改点)
        // 情况 A: 标准接口 (Quality) -> 有 code 字段，必须为 20000
        const isStandardSuccess = payload.code === FASTAPI_ERROR_CODES.SUCCESS;

        // 情况 B: 清洗接口 (Cleaning) -> 无 code，但有 status: "success"
        const isCleaningSuccess = payload.status === "success";

        // 如果既不是标准成功，也不是清洗成功，才算失败
        if (!isStandardSuccess && !isCleaningSuccess) {
          logger.warn(
            `⚠️ [FastAPI] Business Fail:`,
            JSON.stringify(payload, null, 2),
          );

          // 尝试获取错误信息
          const errorMsg =
            payload.msg ||
            payload.message ||
            payload.error?.message ||
            "Unknown FastAPI Business Error";

          // 映射错误码 (优先用 payload.code，没有则用 50000)
          const mappedCode = this.mapFastApiCodeToInternal(
            payload.code || FASTAPI_ERROR_CODES.INTERNAL_ERROR,
          );

          throw new FastApiBusinessException(errorMsg, mappedCode, {
            fastApiCode: payload.code,
            ...payload.data,
            ...payload.error, // 透传 CleaningError 详情
          });
        }

        logger.info(`✅ [FastAPI] Success: ${response.config.url}`);

        // 3. 🟢 智能解包 (Return Data)
        // 如果是标准格式 (Quality)，数据在 .data 里
        if (isStandardSuccess) {
          return payload.data;
        }

        // 如果是清洗格式 (Cleaning)，整个 payload 就是数据 (包含 summary, diff_summary 等)
        return payload;
      },

      // B. 错误响应处理 (保持不变)
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig;

        // --- 重试逻辑 ---
        const shouldRetry =
          config &&
          ((!error.response && error.code !== "ECONNABORTED") ||
            (error.response && error.response.status >= 500)) &&
          (config._retryCount || 0) < this.MAX_RETRY;

        if (shouldRetry) {
          config._retryCount = (config._retryCount || 0) + 1;
          const delay = Math.pow(config._retryCount, 2) * 100;

          logger.warn(
            `🔁 [FastAPI Retry] Attempt ${config._retryCount} in ${delay}ms... (${error.message})`,
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.client(config);
        }

        // --- 最终错误处理 ---
        this.handleFinalError(error);
        throw error;
      },
    );
  }

  /**
   * ⭐️ 新增：FastAPI 错误码到内部错误码的映射
   * 目的：让异常处理器能正确识别错误类型和返回 HTTP 状态码
   */
  private mapFastApiCodeToInternal(fastApiCode: number): number {
    // 直接映射 (Python 和 Node.js 共用相同的错误码设计)
    const codeMap: Record<number, number> = {
      // 客户端错误 (400xx -> Node.js 对应码)
      [FASTAPI_ERROR_CODES.VALIDATION_ERROR]: ERROR_CODES.INVALID_PARAMS,
      [FASTAPI_ERROR_CODES.NOT_FOUND]: ERROR_CODES.NOT_FOUND,
      [FASTAPI_ERROR_CODES.FILE_READ_ERROR]: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.FILE_DECODE_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.FILE_FORMAT_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.DATA_EMPTY_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.DATA_SCHEMA_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.DATA_PARSE_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,

      // 服务端错误 (500xx -> Node.js 对应码)
      [FASTAPI_ERROR_CODES.INTERNAL_ERROR]: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.COMPUTE_FAILED]: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.EXTERNAL_SERVICE_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      [FASTAPI_ERROR_CODES.INFRASTRUCTURE_ERROR]:
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    };

    // 返回映射后的码，未找到则使用通用外部服务错误码
    return codeMap[fastApiCode] || ERROR_CODES.EXTERNAL_SERVICE_ERROR;
  }

  /**
   * 统一错误转换：将 Axios 错误转换为系统内部异常
   */
  private handleFinalError(error: AxiosError): never {
    let message = `FastAPI connection failed: ${error.message}`;
    let code: number = ERROR_CODES.EXTERNAL_SERVICE_ERROR;
    let details: any = null;

    if (error.response) {
      // 服务端返回了错误 (4xx, 5xx)
      const status = error.response.status;
      const data = error.response.data as any;

      logger.error(`❌ [FastAPI] HTTP ${status}`, data);

      message = data?.msg || data?.detail || message;
      details = data;

      // 映射 HTTP 状态码到内部错误码
      if (status === 404) code = ERROR_CODES.NOT_FOUND;
      if (status === 422) code = ERROR_CODES.INVALID_PARAMS;
      if (status === 429) code = ERROR_CODES.RATE_LIMIT_EXCEEDED;
    } else if (error.code === "ECONNABORTED") {
      message = "Analysis Engine timeout";
      code = ERROR_CODES.ANALYSIS_TIMEOUT;
    }

    throw new FastApiBusinessException(message, code, details);
  }

  // ==========================================
  // 3. 业务方法封装
  // ==========================================

  /**
   * 文件探查 (Sync Preview)
   * URL: POST /api/v1/quality/inspect
   */
  async inspectFile(payload: {
    file_id: string;
    file_path: string;
  }): Promise<any> {
    return this.client.post("/api/v1/quality/inspect", payload);
  }

  /**
   * 触发深度分析 (Async Analysis)
   * URL: POST /api/v1/quality/analyze
   */
  async triggerAnalysis(payload: {
    file_id: string;
    file_path: string;
    force_refresh?: boolean;
  }): Promise<any> {
    return this.client.post("/api/v1/quality/analyze", payload);
  }

  /**
   * 获取任务进度
   * URL: GET /api/v1/quality/tasks/{taskId}
   */
  async getTaskProgress(fileId: string): Promise<any> {
    return this.client.get(`/api/v1/quality/tasks/${fileId}`);
  }

  /**
   * 🟢 触发数据清洗
   * 对应 FastAPI: POST /api/v1/cleaning/run
   */
  public async performCleaning(payload: {
    file_id: string;
    data_ref: any;
    user_actions: any[];
    clean_rules: any;
    meta: any;
  }): Promise<any> {
    // URL 需要与 FastAPI 路由一致
    return this.client.post("/api/v1/cleaning/run", payload);
  }

  public async performAnalysis(payload: {
    file_id: string;
    data_ref: any;
    data_selection?: any;
    analysis_config: any;
    meta: any;
  }): Promise<any> {
    return this.client.post("/api/v1/analysis/run", payload);
  }
}

// 导出单例
export const fastApiClient = new FastApiClient();
