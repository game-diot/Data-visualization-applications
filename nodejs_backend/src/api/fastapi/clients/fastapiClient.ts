import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import FormData from "form-data";

import { logger } from "../../../app/config/logger.config";
import { config } from "@app/config/env.config";
import { FastApiBusinessException } from "@shared/exceptions/fastApiBusiness.exception";
import { ApiResponse } from "@shared/types/api.type";

// 扩展 axios 配置：重试机制支持
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
    _maxRetry?: number;
  }
}

/**
 * 统一 FastAPI 客户端工厂函数
 * 仅处理通用逻辑（请求、响应、错误、重试）
 */
export function createFastApiClient(): AxiosInstance {
  const maxRetry = 3;

  const client = axios.create({
    baseURL: config.fastUrl,
    timeout: 30000,
  });

  // ========== 请求拦截器 ==========
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      requestConfig._retryCount = requestConfig._retryCount || 0;
      requestConfig._maxRetry = maxRetry;

      logger.info(
        `[FastAPI Request] [Retry: ${
          requestConfig._retryCount
        }/${maxRetry}] ${requestConfig.method?.toUpperCase()} ${
          requestConfig.url
        }`
      );

      // FormData 自动 boundary 处理
      if (requestConfig.data instanceof FormData) {
        delete (requestConfig.headers as Record<string, string>)[
          "Content-Type"
        ];
      }

      return requestConfig;
    },
    (error: AxiosError) => {
      logger.error("[FastAPI Request Setup Error]", error);
      return Promise.reject(error);
    }
  );

  // ========== 响应拦截器 ==========
  client.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const payload = response.data;

      // 校验 FastAPI 通用结构
      if (
        !payload ||
        typeof payload !== "object" ||
        payload.code === undefined
      ) {
        logger.error("FastAPI 返回格式错误", payload);
        throw new Error("FastAPI 返回格式错误或缺少 code 字段");
      }

      if (payload.code !== 200) {
        logger.warn("[FastAPI Business Error]", {
          code: payload.code,
          msg: payload.msg,
        });

        throw new FastApiBusinessException(
          payload.msg,
          payload.code,
          payload.data
        );
      }

      logger.info("[FastAPI Response] Business Success.");
      return response.data.data;
    },

    async (error: AxiosError) => {
      const cfg = error.config as InternalAxiosRequestConfig;

      // ========== 重试逻辑 ==========
      const shouldRetry =
        ((!error.response && error.code !== "ECONNABORTED") || // 网络错误
          (error.response &&
            error.response.status >= 500 &&
            error.response.status <= 599)) && // 5xx 错误
        cfg._retryCount! < cfg._maxRetry!;

      if (shouldRetry) {
        cfg._retryCount = (cfg._retryCount || 0) + 1;
        const delay = Math.pow(2, cfg._retryCount) * 100;

        logger.warn(
          `[FastAPI Retry] Retrying request in ${delay}ms. Count: ${cfg._retryCount}`
        );

        return new Promise((resolve) =>
          setTimeout(() => resolve(client(cfg)), delay)
        );
      }

      // ========== 错误日志 ==========
      if (error.response) {
        logger.error("[FastAPI HTTP Error]", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        logger.error("[FastAPI Network Error]", error.message);
      } else {
        logger.error("[FastAPI Config Error]", error.message);
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// 单例模式：全局唯一 FastAPI 客户端
export const fastApiClient = createFastApiClient();
