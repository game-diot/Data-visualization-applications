/**
 * 通用 API 响应体结构
 */
export interface ApiResponse<T = any> {
  code: number; // 业务状态码（非 HTTP code）
  msg: string; // 提示信息
  data?: T | null; // 返回内容，可为空
}
