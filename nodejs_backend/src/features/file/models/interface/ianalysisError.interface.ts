export interface IAnalysisError {
  stage: "quality" | "cleaning" | "analysis" | "aiSuggest"; // 发生错误的阶段
  code: string | number; // 错误码 (如 40004, FASTAPI_TIMEOUT)
  message: string; // 人类可读的错误信息
  occurredAt: Date; // 发生时间
  details?: any; // 可选：堆栈或元数据
}
