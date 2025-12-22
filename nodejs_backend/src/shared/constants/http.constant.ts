// src/shared/constants/http.constant.ts

export const HTTP_STATUS = {
  // 成功
  OK: 200,
  CREATED: 201, // 资源创建成功 (如文件上传完成)
  NO_CONTENT: 204, // 无内容 (如预检请求)

  // 客户端错误
  BAD_REQUEST: 400, // 通用参数错误
  UNAUTHORIZED: 401, // 未登录/Token过期
  FORBIDDEN: 403, // 无权限
  NOT_FOUND: 404, // 资源不存在
  PAYLOAD_TOO_LARGE: 413, // ⚠️ 文件太大 (关键)
  UNPROCESSABLE_ENTITY: 422, // 参数格式校验失败
  TOO_MANY_REQUESTS: 429, // 限流

  // 服务端错误
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502, // 调用 FastAPI 失败
  SERVICE_UNAVAILABLE: 503, // 服务暂时不可用
  GATEWAY_TIMEOUT: 504, // FastAPI 分析超时
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
