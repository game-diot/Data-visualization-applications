export const ERROR_CODES = {
  // ========== 系统级 ==========
  SYSTEM_ERROR: 10000,
  DATABASE_CONN_ERROR: 10001,
  REDIS_CONN_ERROR: 10002,
  CONFIG_ERROR: 10003,

  // ========== 请求类 ==========
  INVALID_PARAMS: 20000,
  UNAUTHORIZED: 20001,
  FORBIDDEN: 20003,
  NOT_FOUND: 20004,
  RATE_LIMIT: 20005,

  // ========== 文件类（上传/校验/分析） ==========
  FILE_UPLOAD_FAILED: 30000,
  FILE_TYPE_NOT_ALLOWED: 30001,
  FILE_TOO_LARGE: 30002,
  FILE_NOT_FOUND: 30003,
  FILE_PARSE_ERROR: 30004,
  FILE_ANALYZE_ERROR: 30005,
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
