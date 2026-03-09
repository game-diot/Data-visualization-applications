import React from 'react'
import { Badge, Button, Space } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
// ⬇️ 1. 引入 useQueryClient 和 KEYS
import { useQueryClient } from '@tanstack/react-query'
import { QUALITY_QUERY_KEYS, useQualityStatus } from '@/entities/quality/queries/quality.queries'
import { useQualityRetryMutation } from '@/entities/quality/queries/quality.mutations'

interface Props {
  fileId: string
  isViewingHistory: boolean
}

export const QualityHeader: React.FC<Props> = ({ fileId, isViewingHistory }) => {
  const { data: statusData } = useQualityStatus(fileId)
  const { mutate: retryQuality, isPending: isRetrying } = useQualityRetryMutation(fileId)
  // ⬇️ 2. 获取 queryClient 实例
  const queryClient = useQueryClient()

  const isProcessing = statusData?.uiStatus === 'processing'

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
      <Space size="large">
        <h1 className="text-xl font-bold m-0">质量分析报告</h1>
        <Badge
          status={statusData?.uiStatus || 'default'}
          text={statusData?.message || '未知状态'}
        />
        {isViewingHistory && <Badge count="历史版本" style={{ backgroundColor: '#faad14' }} />}
      </Space>

      <Space>
        <Button
          type="primary"
          icon={<SyncOutlined spin={isProcessing} />}
          loading={isRetrying}
          disabled={isProcessing || isViewingHistory}
          // ⬇️ 3. 核心改造：加入延时和软刷新逻辑
          onClick={() => {
            retryQuality(true, {
              onSuccess: () => {
                // 请求成功发出后，倒数 3 秒
                setTimeout(() => {
                  // 3秒后，宣布当前的最新报告和摘要数据“已过期 (stale)”
                  // React Query 会立刻在后台静默发起请求去拿新数据，然后平滑更新 UI
                  queryClient.invalidateQueries({ queryKey: QUALITY_QUERY_KEYS.latest(fileId) })
                  queryClient.invalidateQueries({ queryKey: QUALITY_QUERY_KEYS.summary(fileId) })
                  queryClient.invalidateQueries({ queryKey: QUALITY_QUERY_KEYS.status(fileId) })
                }, 3000)
              },
            })
          }}
        >
          {isProcessing ? '检测中...' : '重新检测'}
        </Button>
      </Space>
    </div>
  )
}
