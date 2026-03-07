import React from 'react'
import { Tag } from 'antd'
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'

import type { UnifiedTaskStatus } from '@/shared/types/status'

type StatusBadgeProps = {
  status: UnifiedTaskStatus
  text?: string
}

const statusConfig: Record<
  UnifiedTaskStatus,
  { color: string; icon: React.ReactNode; defaultText: string }
> = {
  pending: {
    color: 'default',
    icon: <ClockCircleOutlined />,
    defaultText: '待处理',
  },
  running: {
    color: 'processing',
    icon: <SyncOutlined spin />,
    defaultText: '运行中',
  },
  success: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    defaultText: '已完成',
  },
  failed: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    defaultText: '已失败',
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const config = statusConfig[status] ?? statusConfig.pending

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      className="px-2 py-1 rounded-md border-transparent"
    >
      {text ?? config.defaultText}
    </Tag>
  )
}
