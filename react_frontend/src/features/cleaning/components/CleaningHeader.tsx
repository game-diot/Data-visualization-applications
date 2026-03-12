// src/features/cleaning/components/CleaningHeader.tsx
import React from 'react'
import { Space, Badge, Typography, Tag, Card } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import type { CleaningStatusVM } from '@/entities/cleaning/types/cleaning.types'

const { Title, Text } = Typography

interface Props {
  fileId: string
  qualityVersion: number
  statusData?: CleaningStatusVM
}

export const CleaningHeader: React.FC<Props> = ({ fileId, qualityVersion, statusData }) => {
  const getBadgeStatus = () => {
    switch (statusData?.uiStatus) {
      case 'processing':
        return 'processing'
      case 'success':
        return 'success'
      case 'failed':
        return 'error'
      case 'draft':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Card
      size="small"
      className="mb-6 shadow-sm border border-slate-200"
      // 🌟 修复 Ant Design 的黄牌警告
      styles={{ body: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }}
    >
      <Space size="large" align="center">
        <Space>
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 flex items-center justify-center">
            <RocketOutlined className="text-xl" />
          </div>
          <Title level={4} className="!m-0 text-slate-800 tracking-wide">
            清洗工作台
          </Title>
        </Space>

        <Tag color="geekblue" className="text-sm border-0 bg-blue-50 px-3 py-1 rounded-full">
          基准: Quality V{qualityVersion}
        </Tag>

        <Badge
          status={getBadgeStatus()}
          text={
            <span className="font-medium text-slate-600">
              {statusData?.statusMessage || '状态初始化中...'}
            </span>
          }
        />
      </Space>

      <Space>
        {statusData?.summaryFormatted && (
          <div className="text-sm bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
            <Text type="secondary">最新 V{statusData.latestCleaningVersion} 产物：</Text>
            <Text strong className="mx-1">
              {statusData.summaryFormatted.rowsAfter}
            </Text>
            <Text type="secondary">行 (变动 {statusData.summaryFormatted.cellsModified} 处)</Text>
          </div>
        )}
      </Space>
    </Card>
  )
}
