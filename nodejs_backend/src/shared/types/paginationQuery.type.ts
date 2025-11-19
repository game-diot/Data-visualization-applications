/**
 * 分页查询参数
 * page：当前页（从 1 开始）
 * pageSize：每页条数
 * sortBy：排序字段
 * order：排序方式 asc/desc
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

/**
 * 带分页结构的响应
 */
export interface PaginatedResult<T> {
  total: number; // 总条数
  page: number; // 当前页
  pageSize: number; // 每页大小
  items: T[]; // 本页数据
}
