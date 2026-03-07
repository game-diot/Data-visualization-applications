import { Button, Result, Typography } from 'antd'
import React from 'react'

import { StatusBadge } from '@/shared/ui/StatusBadge'

type TaskErrorFallbackProps = {
  stage?: string
  errorMessage: string
  onRetry: () => void
}

const { Paragraph, Text } = Typography

const truncate = (s: string, max = 2000) =>
  s.length > max ? s.slice(0, max) + '\n... [已截断]' : s

export const TaskErrorFallback: React.FC<TaskErrorFallbackProps> = ({
  stage,
  errorMessage,
  onRetry,
}) => {
  return (
    <Result
      status="error"
      title={
        <div className="flex items-center justify-center gap-2">
          任务执行失败 <StatusBadge status="failed" />
        </div>
      }
      subTitle={stage ? `在执行 [${stage}] 阶段时意外终止。` : '任务执行过程中意外终止。'}
      extra={[
        <Button key="retry" type="primary" onClick={onRetry}>
          重新尝试
        </Button>,
      ]}
    >
      <div className="bg-red-50 p-4 rounded-md">
        <Paragraph>
          <Text strong className="text-red-600">
            错误详情：
          </Text>
        </Paragraph>
        <Paragraph className="text-gray-600 font-mono text-sm mb-0 whitespace-pre-wrap break-words">
          {truncate(errorMessage)}
        </Paragraph>
      </div>
    </Result>
  )
}
