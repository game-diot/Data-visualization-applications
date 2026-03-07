import { Alert, Table, type TableProps } from 'antd'
import React, { useMemo } from 'react'

export type PreviewTableProps<T extends object> = TableProps<T> & {
  /** 默认最多只预览 100 行 */
  maxPreviewRows?: number
  /** 默认表格内部滚动高度 */
  scrollY?: number
}

export function PreviewTable<T extends object>({
  dataSource,
  maxPreviewRows = 100,
  scrollY = 500,
  pagination,
  scroll,
  rowKey,
  ...restProps
}: PreviewTableProps<T>) {
  const defaultRowKey: NonNullable<TableProps<T>['rowKey']> = (_, idx) => `row-${idx ?? 0}`
  const rows = Array.isArray(dataSource) ? dataSource : []

  const safeData = useMemo(() => {
    return rows.length > maxPreviewRows ? rows.slice(0, maxPreviewRows) : rows
  }, [rows, maxPreviewRows])

  const isTruncated = rows.length > maxPreviewRows

  const mergedPagination: TableProps<T>['pagination'] =
    pagination === false
      ? false
      : {
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          ...(typeof pagination === 'object' ? pagination : {}),
        }

  const mergedScroll: TableProps<T>['scroll'] = {
    x: 'max-content',
    y: scrollY,
    ...(scroll ?? {}),
  }

  return (
    <div className="flex flex-col gap-2">
      {isTruncated && (
        <Alert
          message={`为保证性能，当前仅预览前 ${maxPreviewRows} 行数据，全量数据请使用导出功能。`}
          type="info"
          showIcon
        />
      )}

      <Table
        dataSource={safeData}
        pagination={mergedPagination}
        scroll={mergedScroll}
        size="middle"
        rowKey={rowKey ?? defaultRowKey}
        {...restProps}
      />
    </div>
  )
}
