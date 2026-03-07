import React, { useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button, Skeleton } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useFileDetail } from '@/entities/file/queries/file.queries'
import { ErrorPanel } from '@/shared/ui/ErrorPannel'
import { FileSummaryCard } from '../components/FileSummaryCard'
import { FileFlowCards } from '../components/FileFlowCards'
import { useDatasetContextStore } from '../store/datasetContext.store' // [新增]

export default function FileDetailPage() {
  // 强行告诉 TS：不用你猜了，这里面肯定有一个 string 类型的 fileId
  const { fileId } = useParams({ strict: false }) as { fileId: string }
  const navigate = useNavigate()
  // [新增] 引入 Store
  const { syncFileId } = useDatasetContextStore()

  // [新增] 路由进入时，自动对齐当前上下文
  useEffect(() => {
    if (fileId) {
      syncFileId(fileId as string)
    }
  }, [fileId, syncFileId])

  const { data, isLoading, error } = useFileDetail(fileId as string)

  if (isLoading)
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    )
  if (error || !data)
    return (
      <div className="p-6">
        <ErrorPanel message="无法加载数据集详情" detail={(error as any)?.message} />
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

      {/* 核心业务组件组装 */}
      <FileSummaryCard data={data} />
      <FileFlowCards data={data} />
    </div>
  )
}
