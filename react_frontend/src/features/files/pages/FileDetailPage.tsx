import { useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button, Skeleton } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

// ⬇️ 关键修正：引入详情专用的 Hook
import { useFileDetail } from '@/entities/file/queries/file.queries'
import { ErrorPanel } from '@/shared/ui/ErrorPannel'
import { FileSummaryCard } from '../components/FileSummaryCard'
import { FileFlowCards } from '../components/FileFlowCards'
import { useDatasetContextStore } from '../store/datasetContext.store'

export default function FileDetailPage() {
  // TanStack Router 获取参数
  const { fileId } = useParams({ strict: false }) as { fileId: string }
  const navigate = useNavigate()
  const { syncFileId } = useDatasetContextStore()

  // 006：同步工作上下文
  useEffect(() => {
    if (fileId) {
      syncFileId(fileId)
    }
  }, [fileId, syncFileId])

  /**
   * 005 & 007：调用详情 Hook
   * 此时 data 的类型会被 TS 自动推导为 DatasetDetailVM
   * 完美解决你提到的“类型缺失 totalRows 等属性”的问题
   */
  const { data, isLoading, error } = useFileDetail(fileId)

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    )

  if (error || !data)
    return (
      <div className="p-6">
        <ErrorPanel title="无法加载数据集详情" detail={(error as any)?.message} />
      </div>
    )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 顶部面包屑导航区 */}
      <div className="mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="text-slate-500 hover:text-slate-800 -ml-4"
          onClick={() => navigate({ to: '/files' })}
        >
          返回数据集列表
        </Button>
      </div>

      {/* 008：核心业务组件组装 */}
      {/* 此时 data 是 DatasetDetailVM，完美适配下级组件 */}
      <FileSummaryCard data={data} />

      <div className="mt-6">
        <FileFlowCards data={data} />
      </div>
    </div>
  )
}
