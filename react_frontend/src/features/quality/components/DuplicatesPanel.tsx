import React, { useMemo } from 'react'
import { Table, Card, Typography } from 'antd'
import type { QualityReportVM } from '@/entities/quality/types/quality.type'

const { Text } = Typography

interface Props {
  data: QualityReportVM['duplicates']
}

export const DuplicatesPanel: React.FC<Props> = ({ data }) => {
  // 转换扁平的 number[] 为 Table 需要的 object[]
  const tableData = useMemo(() => {
    return data.rows.map((rowIndex) => ({
      key: rowIndex,
      rowIndex: rowIndex,
    }))
  }, [data.rows])

  return (
    <Card title="完全重复行检测" bordered={false} className="shadow-sm h-full">
      <div className="mb-4">
        <Text type="secondary">共发现 </Text>
        <Text strong type="danger">
          {data.totalRows}
        </Text>
        <Text type="secondary"> 行完全重复的数据。</Text>
      </div>
      <Table
        dataSource={tableData}
        columns={[
          { title: '重复行所在的索引 (Row Index)', dataIndex: 'rowIndex', key: 'rowIndex' },
        ]}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        size="small"
        locale={{ emptyText: '未发现重复行' }}
      />
    </Card>
  )
}
