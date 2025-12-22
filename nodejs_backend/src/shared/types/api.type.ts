/**
 * 统一 API 响应结构
 * @template T 响应数据的类型 (默认为 null)
 */
import { PaginatedResult } from "./pagination.type";
export interface ApiResponse<T = any> {
  // 业务状态码 (对应 ERROR_CODES，如 20000, 50000)
  code: number;

  // 状态标识 (success: 成功, error: 系统错误, fail: 业务/校验失败)
  status: "success" | "error" | "fail";

  // 提示信息 (User-friendly message)
  message: string;

  // 数据载荷 (成功时返回 T，失败时可能为 null)
  data?: T | PaginatedResult<any>; // 或者由具体的泛型传入

  // 错误详情 (通常用于 400/422 校验错误，告诉前端具体哪个字段错了)
  details?: any;

  // 开发环境堆栈信息 (仅非生产环境返回)
  stack?: string;
}

/**
 * 分页数据结构
 * 用于列表接口的 data 字段
 */
export interface PaginatedData<T> {
  items: T[]; // 当前页的数据列表
  total: number; // 总条数
  page: number; // 当前页码
  pageSize: number; // 每页条数
  totalPages: number; // 总页数
}
