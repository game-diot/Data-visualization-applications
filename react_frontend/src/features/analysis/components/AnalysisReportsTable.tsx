import React from 'react'
import { Card, Table, Button, Tag, Typography, Empty, Skeleton } from 'antd'
import { LineChartOutlined, RightOutlined } from '@ant-design/icons'
import { useAnalysisReports } from '@/entities/analysis/queries/analysis.queries'

const { Text } = Typography

interface Props {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  onViewDetail: (analysisVersion: number) => void
}

export const AnalysisReportsTable: React.FC<Props> = ({
  fileId,
  qualityVersion,
  cleaningVersion,
  onViewDetail,
}) => {
  const {
    data: reports,
    isLoading,
    error,
  } = useAnalysisReports(fileId, qualityVersion, cleaningVersion)

  if (isLoading)
    return (
      <Card className="shadow-sm mt-6">
        <Skeleton active />
      </Card>
    )
  if (error)
    return (
      <Card className="shadow-sm mt-6">
        <Text type="danger">加载历史报告失败</Text>
      </Card>
    )

  if (!reports || reports.length === 0) {
    return (
      <Card className="shadow-sm mt-6 border border-slate-200">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="该清洗快照下暂无分析记录，请在上方配置并执行分析"
        />
      </Card>
    )
  }

  const columns = [
    {
      title: '版本号',
      dataIndex: 'analysisVersion',
      key: 'version',
      render: (ver: number) => (
        <Tag color="geekblue" className="font-mono">
          V{ver}
        </Tag>
      ),
      width: 100,
    },
    {
      title: '分析类型',
      dataIndex: 'analysisTypeLabel',
      key: 'type',
      render: (text: string, record: any) => (
        <span className="font-medium text-slate-700">
          <LineChartOutlined className="mr-2 text-indigo-500" />
          {text}
        </span>
      ),
      width: 180,
    },
    {
      title: '生成时间',
      dataIndex: 'createdAtFormatted',
      key: 'createdAt',
      render: (text: string) => (
        <Text type="secondary" className="text-xs">
          {text}
        </Text>
      ),
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" size="small" onClick={() => onViewDetail(record.analysisVersion)}>
          查看可视化大屏 <RightOutlined className="text-xs" />
        </Button>
      ),
      width: 150,
      align: 'right' as const,
    },
  ]

  return (
    <Card title="分析报告历史" size="small" className="shadow-sm mt-6 border-slate-200">
      <Table
        dataSource={reports}
        columns={columns}
        rowKey="analysisVersion" // 使用版本号作为 React Key
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        size="small"
        className="font-sans"
      />
    </Card>
  )
}
