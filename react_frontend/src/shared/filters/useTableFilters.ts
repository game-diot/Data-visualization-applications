// src/shared/filters/useTableFilters.ts
import type { TablePaginationConfig } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'

type Order = 'asc' | 'desc'

type TableToQueryOptions<T> = {
  /** sortBy 字段白名单（避免把任意列名写进 URL） */
  allowedSortFields?: readonly (keyof T | string)[]
}

export function useTableFilters<TFilters extends Record<string, unknown>>(
  updateFilters: (filters: Partial<TFilters> & Record<string, unknown>) => void,
  options?: TableToQueryOptions<TFilters>,
) {
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, unknown>,
    sorter: SorterResult<any> | SorterResult<any>[],
  ) => {
    const next: Record<string, unknown> = {
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 10,
    }

    // MVP：单列排序
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter
    const field = singleSorter?.field

    if (field) {
      const sortField = String(field)

      if (options?.allowedSortFields && !options.allowedSortFields.includes(sortField)) {
        // 不在白名单，直接忽略（防止意外写入 URL）
      } else {
        if (singleSorter.order === 'ascend') {
          next.sortBy = sortField
          next.order = 'asc' as Order
        } else if (singleSorter.order === 'descend') {
          next.sortBy = sortField
          next.order = 'desc' as Order
        } else {
          // 约定：null 表示从 URL 删除这个参数
          next.sortBy = null
          next.order = null
        }
      }
    }

    updateFilters(next as any)
  }

  return { handleTableChange }
}
