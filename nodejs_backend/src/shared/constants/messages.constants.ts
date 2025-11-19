export const MESSAGES = {
  // ========== 系统类 ==========
  SYSTEM_ERROR: "服务器内部错误",
  DATABASE_CONN_ERROR: "数据库连接失败",
  REDIS_CONN_ERROR: "Redis 服务不可用",
  CONFIG_ERROR: "服务配置异常",

  // ========== 通用 ==========
  SUCCESS: "操作成功",
  PARAMS_INVALID: "参数不合法",
  NOT_FOUND: "资源不存在",
  RATE_LIMIT: "请求过于频繁，请稍后再试",

  // ========== 文件相关 ==========
  FILE_UPLOAD_SUCCESS: "文件上传成功",
  FILE_UPLOAD_FAILED: "文件上传失败",
  FILE_TYPE_NOT_ALLOWED: "不支持的文件类型",
  FILE_TOO_LARGE: "文件过大",
  FILE_NOT_FOUND: "未找到指定文件",
  FILE_PARSE_ERROR: "文件解析失败",
  FILE_ANALYZE_ERROR: "文件分析失败",

  UNAUTHORIZED: "用户身份失败",
} as const;

export type MessageKey = keyof typeof MESSAGES;
