// 1. 核心：直接引用 Model 层的定义，拒绝重复代码
import { IQualityAnalysisResult } from "../models/interface/quality-result.interface";

// ==========================================
// 1. 发送给 Python 的请求 (Request)
// ==========================================

/**
 * 触发质量分析的 Payload
 * 对应 Python 端 endpoint: POST /api/quality/check
 */
export interface StartAnalysisRequestDTO {
  file_id: string; // 传给 Python，Python 原样返回
  file_path: string; // Node 告诉 Python 文件在哪里 (绝对路径)

  // 可选：分析配置参数
  config?: {
    enable_deep_analysis?: boolean; // 是否开启深度分析
    sample_rate?: number; // 采样率
  };
}

// ==========================================
// 2. 从 Python 接收的响应 (Response)
// ==========================================

/**
 * FastAPI 返回的分析结果
 * * 技巧：这里直接继承或使用 IQualityAnalysisResult
 * 这样就保证了 DTO 和 Model 永远保持同步！
 */
export interface FastApiQualityResponseDTO extends IQualityAnalysisResult {
  // 如果 API 返回的数据比数据库存的数据多一些字段（比如处理时间），可以在这里扩展
  processing_time_ms?: number;
  api_version?: string;
}

// ==========================================
// 3. 前端交互 DTO (如果需要)
// ==========================================

/**
 * 前端触发分析的参数
 * (前端不需要传 path，只需要传 fileId)
 */
export interface TriggerAnalysisDTO {
  fileId: string;
}
