export type CleaningErrorStage =
  | "validation" // 参数/Session校验失败
  | "dispatch" // Node 内部调度失败
  | "fastapi" // Python 服务报错
  | "execution" // 运行中崩溃
  | "persistence" // 结果落库失败
  | "unknown";

export interface ICleaningError {
  stage: CleaningErrorStage;

  code: string; // 机器码 e.g., "FASTAPI_400", "SESSION_LOCKED"
  message: string; // 人类可读信息

  detail?: any; // 原始堆栈 / HTTP 响应体 (不直接展示给用户，用于排查)

  retryable: boolean; // 关键：指示前端是否显示"重试"按钮

  occurredAt: Date;
}
