import React from 'react'
import { Table, Card, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AnomalyDetailVM } from '@/entities/quality/types/quality.type'

interface Props {
  data: AnomalyDetailVM[]
}

export const AnomaliesTable: React.FC<Props> = ({ data }) => {
  const columns: ColumnsType<AnomalyDetailVM> = [
    { title: '行号 (Row)', dataIndex: 'row', key: 'row', width: 100 },
    { title: '异常列 (Column)', dataIndex: 'column', key: 'column', width: 150 },
    {
      title: '异常值 (Value)',
      dataIndex: 'displayValue',
      key: 'displayValue',
      width: 150,
      render: (val) => <span className="font-mono text-red-500">{val}</span>,
    },
    {
      title: '检测类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (text) => <Tag color="warning">{text}</Tag>,
    },
    { title: '判研原因 (Reason)', dataIndex: 'reason', key: 'reason' },
  ]

  return (
    <Card title="异常值检测明细 (Anomalies)" bordered={false} className="shadow-sm mt-6">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key" // 使用我们在 Mapper 里拼装的唯一键
        size="small"
        // 🚀 核心大招：开启 AntD v5 原生虚拟滚动
        virtual={true}
        scroll={{ y: 400, x: 'max-content' }} // 必须固定高度才能触发虚拟滚动
        pagination={false} // 虚拟滚动不需要传统分页
        locale={{ emptyText: '未检测到明显异常值' }}
      />
    </Card>
  )
}
