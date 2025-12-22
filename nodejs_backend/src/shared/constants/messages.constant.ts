/**
 * 系统消息常量定义
 * 职责：统一管理接口返回的提示文字 (Human Readable)
 * 避免在业务代码中硬编码中文字符串
 */
export const MESSAGES = {
  // ============================
  // 1. 系统与基础 (System)
  // ============================
  SYSTEM_ERROR: "服务器内部错误，请联系管理员",
  DATABASE_CONN_ERROR: "数据库连接异常",
  REDIS_CONN_ERROR: "缓存服务暂时不可用",
  CONFIG_ERROR: "系统配置加载失败",
  NOT_FOUND: "请求的资源不存在",
  RATE_LIMIT: "请求过于频繁，请稍后再试",
  UNKNOWN_ERROR: "发生未知错误",

  // ============================
  // 2. 成功响应 (Success)
  // ============================
  SUCCESS: "操作成功",
  CREATED: "创建成功",
  UPDATED: "更新成功",
  DELETED: "删除成功",

  // ============================
  // 3. 认证与权限 (Auth)
  // ============================
  UNAUTHORIZED: "身份验证失败，请重新登录",
  TOKEN_EXPIRED: "登录会话已过期，请重新登录",
  FORBIDDEN: "您没有权限执行此操作",
  PARAMS_INVALID: "请求参数错误或缺失",

  // ============================
  // 4. 文件生命周期 (File)
  // ============================
  FILE_UPLOAD_SUCCESS: "文件上传成功",
  FILE_UPLOAD_FAILED: "文件上传失败，请重试",
  FILE_TYPE_NOT_ALLOWED: "不支持该文件格式，仅支持 Excel/CSV/JSON",
  FILE_TOO_LARGE: "文件大小超过限制", // 建议配合 file.utils 在报错时动态提示具体大小
  FILE_NOT_FOUND: "未找到指定的文件",
  FILE_EMPTY: "上传的文件内容为空",

  // ============================
  // 5. 数据分析与清洗 (Analysis - 毕设核心)
  // ============================
  FILE_PARSE_ERROR: "文件解析失败，请检查文件格式是否损坏",
  FILE_ANALYZE_START: "正在开始数据分析任务...",
  FILE_ANALYZE_SUCCESS: "数据分析完成",
  FILE_ANALYZE_FAILED: "数据分析服务调用失败",
  DATA_CLEAN_SUCCESS: "数据清洗完成",
  AI_GENERATE_SUCCESS: "AI 报告生成成功",
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageValue = (typeof MESSAGES)[keyof typeof MESSAGES];
