import { PaginatedResult } from "../types/pagination.type";

/**
 * 分页结果构造器
 * 用于将 Repository 的原始结果转换为前端需要的完整分页结构
 */
export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / (pageSize || 10)), // 防止除以0
  };
}
