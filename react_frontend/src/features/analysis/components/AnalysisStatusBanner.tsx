import React from 'react'
import { Alert, Spin, Tag, Space, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useAnalysisStatusPolling } from '@/entities/analysis/queries/analysis.queries'

const { Text } = Typography

// 阶段字典映射
const STAGE_DICT: Record<string, string> = {
  received: '已接收',
  load: '加载数据中',
  validate: '校验规则中',
  process: '模型运算中',
  export: '打包产物中',
  done: '分析完毕',
}

export const AnalysisStatusBanner: React.FC<{
  fileId: string
  qualityVersion: number
  cleaningVersion: number
}> = ({ fileId, qualityVersion, cleaningVersion }) => {
  const { data: statusData, isLoading } = useAnalysisStatusPolling(
    fileId,
    qualityVersion,
    cleaningVersion,
  )

  if (isLoading) return <Spin />
  if (!statusData) return null

  const { currentTask, latestTask } = statusData

  // 1. 正在运行中...
  if (currentTask) {
    return (
      <Alert
        message={
          <Space>
            <Spin indicator={<LoadingOutlined spin />} />
            <Text strong className="text-blue-700">
              分析引擎全速运转中...
            </Text>
            <Tag color="processing" className="ml-4">
              {STAGE_DICT[currentTask.stage] || currentTask.stage}
            </Tag>
          </Space>
        }
        type="info"
        className="border-blue-200 bg-blue-50 shadow-sm mb-6"
      />
    )
  }

  // 2. 没有运行中的任务，且最新任务是失败的
  if (latestTask?.status === 'failed') {
    return (
      <Alert
        message={<Text strong>最新分析任务执行失败</Text>}
        description={
          <div className="mt-1">
            <Tag color="error">中断阶段: {STAGE_DICT[latestTask.stage] || latestTask.stage}</Tag>
            <Text type="danger" className="ml-2">
              {latestTask.error?.message || '未知错误'}
              {latestTask.error?.code && ` (错误码: ${latestTask.error.code})`}
            </Text>
          </div>
        }
        type="error"
        showIcon
        icon={<CloseCircleOutlined />}
        className="mb-6 shadow-sm"
      />
    )
  }

  // 3. 成功或空闲状态 (UI 留白或展示轻量提示，因为成功结果会展示在下方的报告列表里)
  if (latestTask?.status === 'success') {
    return (
      <Alert
        message={
          <Text strong className="text-green-700">
            分析已完成，请在下方历史记录查看报告。
          </Text>
        }
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        className="mb-6 shadow-sm border-green-200 bg-green-50"
      />
    )
  }

  return null // 还没有触发过任务
}
