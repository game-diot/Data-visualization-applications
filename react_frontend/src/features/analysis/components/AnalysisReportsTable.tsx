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

  // 1. Loading 骨架
  if (isLoading)
    return (
      <Card className="shadow-sm border-slate-200 mt-6">
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )

  // 2. 异常兜底
  if (error)
    return (
      <Card className="shadow-sm border-slate-200 mt-6">
        <Text type="danger">加载历史报告失败</Text>
      </Card>
    )

  // 3. 空状态提示
  if (!reports || reports.length === 0) {
    return (
      <Card className="shadow-sm border-slate-200 mt-6 border-dashed bg-slate-50/50">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="该清洗快照下暂无分析记录，请在上方配置并提交分析任务"
        />
      </Card>
    )
  }

  // 4. 表格列定义
  const columns = [
    {
      title: '版本号',
      dataIndex: 'analysisVersion',
      key: 'version',
      render: (ver: number) => (
        <Tag color="geekblue" className="font-mono rounded-full px-3">
          V{ver}
        </Tag>
      ),
      width: 100,
    },
    {
      title: '分析类型',
      dataIndex: 'analysisTypeLabel',
      key: 'type',
      render: (text: string) => (
        <span className="font-medium text-slate-700">
          <LineChartOutlined className="mr-2 text-indigo-500" />
          {text}
        </span>
      ),
      width: 180,
    },
    {
      title: '数据切片',
      dataIndex: 'dataShapeLabel',
      key: 'shape',
      render: (text: string) => (
        <Tag color="default" className="border-0 bg-slate-100 text-slate-500">
          {text}
        </Tag>
      ),
      width: 180,
    },
    {
      title: '生成时间',
      dataIndex: 'createdAtFormatted',
      key: 'createdAt',
      render: (text: string) => (
        <Text type="secondary" className="text-xs font-mono">
          {text}
        </Text>
      ),
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          size="small"
          className="font-medium"
          onClick={() => onViewDetail(record.analysisVersion)}
        >
          查看可视化大屏 <RightOutlined className="text-[10px]" />
        </Button>
      ),
      width: 150,
      align: 'right' as const,
    },
  ]

  return (
    <Card
      title="分析报告历史 (Immutable History)"
      size="small"
      className="shadow-sm mt-6 border-slate-200"
    >
      <Table
        dataSource={reports}
        columns={columns}
        rowKey="analysisVersion" // 严谨：使用 analysisVersion 作为稳定 Key
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        size="small"
        className="font-sans"
      />
    </Card>
  )
}
