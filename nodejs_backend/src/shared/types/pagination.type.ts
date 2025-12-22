/**
 * 基础分页查询参数接口
 * 通常用于 Controller 接收 req.query 后的类型定义
 */
export interface PaginationQuery {
  // 当前页 (默认为 1)
  page?: number;

  // 每页条数 (默认为 10)
  pageSize?: number;

  // 排序字段 (如 'createdAt')
  sortBy?: string;

  // 排序方向
  order?: "asc" | "desc";

  // 搜索关键字 (通用模糊搜索)
  keyword?: string;

  // 允许其他动态筛选参数 (例如 status, type 等)
  [key: string]: any;
}

/**
 * 分页数据响应结构
 * @template T 列表项的类型
 */
export interface PaginatedResult<T> {
  // 当前页的具体数据列表
  items: T[];

  // 数据库中的总记录数
  total: number;

  // 当前页码
  page: number;

  // 每页容量
  pageSize: number;

  // 总页数 (由 total / pageSize 向上取整得出)
  totalPages: number;
}
