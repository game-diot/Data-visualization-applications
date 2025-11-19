/**
 * 通用 API 响应体结构
 */
export interface ApiResponse<T = any> {
  code: number; // 业务状态码（非 HTTP code）
  msg: string; // 提示信息
  data?: T | null; // 返回内容，可为空
}

/**
 * 工具函数：构建统一响应
 */
export const buildResponse = <T>(
  code: number,
  msg: string,
  data?: T | null
): ApiResponse<T> => ({
  code,
  msg,
  ...(data !== undefined && { data }),
});
