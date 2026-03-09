import { useParams } from '@tanstack/react-router'
import { Skeleton, Alert } from 'antd'
import { QualityHeader } from '../components/QualityHeader'
import { OverviewCards } from '../components/OverViewCards'
// 引入防腐层暴露的弹药
import { useQualityLatest, useQualityByVersion } from '@/entities/quality/queries/quality.queries'
// 引入环节三的智能轮询
import { useQualityStatusPolling } from '../hooks/useQualityStatusPolling'
// 引入环节四的 UI 状态
import { useQualityStore } from '../store/quality.store'
import { AnomaliesTable } from '../components/AnomaliesTable'
import { DuplicatesPanel } from '../components/DuplicatesPanel'
import { MissingTable } from '../components/MissingTable'
import { TypesPanel } from '../components/TypesPanel'

export default function QualityPage() {
  // 1. 从 TanStack Router 获取文件 ID
  const { fileId } = useParams({ strict: false }) as { fileId: string }

  // 2. 从 Zustand 获取用户当前选中的版本 (null 代表看最新)
  const { selectedVersion } = useQualityStore()

  // 3. 激活“呼吸灯”状态轮询（只要组件挂载，就会根据 status 自动决定是否轮询）
  useQualityStatusPolling(fileId)

  // 4. 核心战术：根据版本号状态，动态决定去哪个 Hook 拿数据！
  // 绝妙之处：这两个 Hook 返回的 data 类型都是完美的 QualityReportVM！
  const latestQuery = useQualityLatest(fileId)
  const versionQuery = useQualityByVersion(fileId, selectedVersion)

  // 决定当前使用的数据源
  const isViewingHistory = selectedVersion !== null
  const activeQuery = isViewingHistory ? versionQuery : latestQuery
  const { data: reportData, isLoading, error } = activeQuery

  // 5. 全局骨架屏防御
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    )
  }

  // 6. 全局错误防御
  if (error || !reportData) {
    return (
      <div className="p-6">
        <Alert
          message="加载报告失败"
          description={(error as Error)?.message}
          type="error"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 头部：展示文件名、状态 Badge、重试按钮 */}
      <QualityHeader fileId={fileId} isViewingHistory={isViewingHistory} />

      {/* 摘要卡片：展示 100分、896行 等核心指标 */}
      <OverviewCards data={reportData} />

      {/* 下方的详细面板组（此处预留，下一批次写具体的图表和 Table） */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MissingTable data={reportData.missing} />
        <DuplicatesPanel data={reportData.duplicates} />
      </div>

      <AnomaliesTable data={reportData.anomalies.details} />
      <TypesPanel data={reportData.columnTypes} />
    </div>
  )
}
