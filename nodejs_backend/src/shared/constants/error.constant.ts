// src/shared/constants/error.constant.ts

export const ERROR_CODES = {
  // ============================
  // 10000 - 19999: 系统级错误 (Infrastructure)
  // ============================
  SYSTEM_ERROR: 10000, // 未知系统错误
  DATABASE_CONN_ERROR: 10001, // 数据库连接失败
  DATABASE_QUERY_ERROR: 10002, // 数据库查询失败
  REDIS_CONN_ERROR: 10003, // 缓存连接失败
  IO_ERROR: 10004, // 文件读写权限错误
  EXTERNAL_SERVICE_ERROR: 10005, // 外部服务 (FastAPI) 调用失败

  // ============================
  // 20000 - 29999: 请求与权限 (Auth & Request)
  // ============================
  INVALID_PARAMS: 20000, // 参数校验不通过
  UNAUTHORIZED: 20001, // 未认证 (未携带 Token)
  TOKEN_EXPIRED: 20002, // Token 已过期
  FORBIDDEN: 20003, // 无权限访问
  NOT_FOUND: 20004, // 资源未找到
  RATE_LIMIT_EXCEEDED: 20005, // 请求过于频繁

  // ============================
  // 30000 - 39999: 文件与数据 (File & Data)
  // ============================
  FILE_UPLOAD_FAILED: 30000, // 上传中断或写入失败
  FILE_TYPE_NOT_ALLOWED: 30001, // 不支持的文件格式 (如上传了 .exe)
  FILE_TOO_LARGE: 30002, // 文件体积超限
  FILE_NOT_FOUND: 30003, // 物理文件丢失
  FILE_PARSE_ERROR: 30004, // CSV/Excel 解析失败 (格式损坏)
  FILE_EMPTY: 30005, // 空文件

  // ============================
  // 40000 - 49999: 分析与清洗 (Analysis & Cleaning)
  // ============================

  VALIDATION_ERROR: 40000, // ✅ 对应 BadRequest

  ANALYSIS_TIMEOUT: 40001, // 分析耗时过长
  CLEAN_RULE_INVALID: 40002, // 清洗规则不合法
  AI_GENERATE_FAILED: 40003, // LangChain 生成报告失败
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
