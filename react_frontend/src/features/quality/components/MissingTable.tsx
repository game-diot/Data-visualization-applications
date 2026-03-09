import React, { useMemo } from 'react'
import { Table, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { QualityReportVM } from '@/entities/quality/types/quality.type'

interface Props {
  data: QualityReportVM['missing']
}

export const MissingTable: React.FC<Props> = ({ data }) => {
  // 净水器在防腐层，这里只做简单的结构适配：将 { "Age": 10 } 转化为 [{ col: "Age", count: 10 }]
  const tableData = useMemo(() => {
    return Object.entries(data.byColumn)
      .map(([col, count]) => ({
        key: col,
        column: col,
        count: count as number,
      }))
      .filter((item) => item.count > 0) // 只展示有缺失的列
  }, [data.byColumn])

  const columns: ColumnsType<any> = [
    { title: '列名 (Column)', dataIndex: 'column', key: 'column' },
    {
      title: '缺失单元格数',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
      defaultSortOrder: 'descend',
    },
  ]

  return (
    <Card title="缺失值分布" bordered={false} className="shadow-sm h-full">
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        size="small"
        locale={{ emptyText: '完美！该数据集没有缺失值' }}
      />
    </Card>
  )
}
