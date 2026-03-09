import React from 'react'
import { Table, Card, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ColumnTypeVM } from '@/entities/quality/types/quality.type'

interface Props {
  data: ColumnTypeVM[]
}

export const TypesPanel: React.FC<Props> = ({ data }) => {
  const columns: ColumnsType<ColumnTypeVM> = [
    { title: '列名 (Column)', dataIndex: 'columnName', key: 'columnName' },
    {
      title: '数据类型 (Dtype)',
      dataIndex: 'dtype',
      key: 'dtype',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '业务定性',
      key: 'isNumeric',
      dataIndex: 'isNumeric',
      render: (isNumeric) =>
        isNumeric ? (
          <Tag color="success">数值型 (可计算)</Tag>
        ) : (
          <Tag color="default">类别/文本型</Tag>
        ),
    },
  ]

  return (
    <Card title="列画像与类型字典" bordered={false} className="shadow-sm">
      <Table
        dataSource={data}
        columns={columns}
        rowKey="columnName"
        size="small"
        // 🚀 核心大招：开启 AntD v5 原生虚拟滚动
        virtual={true}
        scroll={{ y: 300, x: 'max-content' }} // 必须固定高度才能触发虚拟滚动
        pagination={false} // 虚拟滚动不需要传统分页
        locale={{ emptyText: '未检测到明显异常值' }}
      />
    </Card>
  )
}
