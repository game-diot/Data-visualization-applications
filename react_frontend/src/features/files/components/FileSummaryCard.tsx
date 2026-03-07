import React from 'react'
import { Card, Descriptions, Typography, Statistic, Row, Col } from 'antd'
import { DatabaseOutlined, TableOutlined } from '@ant-design/icons'
import type { DatasetDetailVM } from '@/entities/file/types/file.types'
import { StatusBadge } from '@/shared/ui/StatusBadge'

const { Title } = Typography

export const FileSummaryCard: React.FC<{ data: DatasetDetailVM }> = ({ data }) => {
  return (
    <Card bordered={false} className="shadow-sm mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Title level={4} className="!mb-1">
            {data.name}
          </Title>
          <span className="text-slate-400 text-sm">
            格式: {data.extension} | ID: {data.id}
          </span>
        </div>
        <StatusBadge status={data.uiStatus} text={data.stage} />
      </div>

      <Row gutter={32} className="mb-6 bg-slate-50 p-4 rounded-lg">
        <Col span={8}>
          <Statistic
            title="总行数 (Rows)"
            value={data.totalRows}
            prefix={<TableOutlined className="text-blue-400" />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="总列数 (Columns)"
            value={data.totalColumns}
            prefix={<DatabaseOutlined className="text-emerald-400" />}
          />
        </Col>
        <Col span={8}>
          <Statistic title="数据大小" value={data.sizeFormatted} />
        </Col>
      </Row>

      <Descriptions size="small" column={2}>
        <Descriptions.Item label="上传时间">{data.uploadedAtFormatted}</Descriptions.Item>
        {data.errorMessage && (
          <Descriptions.Item label="异常信息">
            <span className="text-red-500">{data.errorMessage}</span>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}
