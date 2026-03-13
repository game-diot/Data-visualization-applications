import React, { useState } from 'react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { Alert, Skeleton, Result, Button } from 'antd'
import { ClearOutlined } from '@ant-design/icons'

// Entities Hooks
import { useFileDetail } from '@/entities/file/queries/file.queries'
import {
  useAnalysisCatalog,
  useAnalysisRunMutation,
} from '@/entities/analysis/queries/analysis.queries'

// Components
import { AnalysisHeader } from '../components/AnalysisHeader'
import { AnalysisCatalogPanel } from '../components/AnalysisCatalogPanel'
import { AnalysisConfigForm } from '../components/AnalysisConfigForm'
import { AnalysisStatusBanner } from '../components/AnalysisStatusBanner'
import { AnalysisReportsTable } from '../components/AnalysisReportsTable'
import { AnalysisReportDrawer } from '../components/AnalytsisReportDrawer'

// Schemas
import type { AnalysisConfigFormValues } from '../schemas/analysis.schema'

const AnalysisPage: React.FC = () => {
  // =========================================================
  // 1. 所有的 Hooks 必须在最顶层无条件调用！绝对不能有 if 阻断！
  // =========================================================
  const { fileId } = useParams({ strict: false }) as { fileId: string }
  const searchParams = useSearch({ strict: false }) as { qv?: number; cv?: number }
  const navigate = useNavigate()

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [drawerVersion, setDrawerVersion] = useState<number | null>(null)

  const { data: fileDetail, isLoading, error } = useFileDetail(fileId)

  // 即使 fileDetail 还没加载完，这里用可选链推导出的也是 0，安全的
  const resolvedQv = searchParams.qv ?? fileDetail?.latestQualityVersion ?? 0
  const resolvedCv = searchParams.cv ?? 0

  // 依赖 resolvedQv 的 Hook，React Query 内部会判断如果 qv 是 0 就 pending，不报错
  const { data: catalogData } = useAnalysisCatalog(fileId, resolvedQv)
  const runMutation = useAnalysisRunMutation(fileId, resolvedQv, resolvedCv)

  // =========================================================
  // 2. 所有的 UI 拦截和兜底 (Early Returns) 必须放在 Hooks 之后！
  // =========================================================
  if (!fileId) return <Alert message="缺失 File ID" type="error" className="m-6" />

  // 正在加载文件详情，显示骨架屏
  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    )

  if (error || !fileDetail) return <Alert message="获取文件信息失败" type="error" className="m-6" />

  // 拦截未清洗的数据
  const isCleaningDone = resolvedCv > 0
  if (!isCleaningDone) {
    return (
      <div className="p-12 bg-white m-6 rounded-lg shadow-sm border border-slate-200 mt-20">
        <Result
          status="warning"
          title="前置依赖未就绪 (Missing Cleaned Asset)"
          subTitle="分析模块必须基于清洗产物运行。您尚未完成清洗，或访问链接缺失清洗版本参数 (cv)。"
          extra={
            <Button
              type="primary"
              size="large"
              icon={<ClearOutlined />}
              onClick={() => navigate({ to: '/files/$fileId/cleaning', params: { fileId } })}
              className="bg-indigo-600 hover:bg-indigo-500"
            >
              前往数据清洗工作台
            </Button>
          }
        />
      </div>
    )
  }

  // =========================================================
  // 3. 事件处理与主渲染区 (完全安全)
  // =========================================================
  const handleRunAnalysis = (formValues: AnalysisConfigFormValues) => {
    const payload = {
      qualityVersion: resolvedQv,
      cleaningVersion: resolvedCv,
      input: 'cleaned' as const,
      dataSelection: formValues.dataSelection,
      analysisConfig: formValues.analysisConfig,
    }

    console.log('🚀 准备发射给 FastAPI 的 Payload:', payload)
    runMutation.mutate(payload)
  }
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* 环节一：上下文锁定 */}
      <AnalysisHeader
        fileDetail={fileDetail}
        qualityVersion={resolvedQv}
        cleaningVersion={resolvedCv}
      />

      {/* 🚀 修复点 1：给 grid 加上 items-start，取消子元素默认的等高拉伸，为 Sticky 做准备 */}
      <div className="grid grid-cols-12 gap-6 mt-6 items-start">
        {/* 左侧：环节二 (Catalog)
            🚀 修复点 2：去掉坑爹的 h-[600px]！
            改成 sticky top-6（吸顶），max-h-[calc(100vh-120px)]（不超过屏幕高度），并开启内部滚动（overflow-y-auto）
        */}
        <div className="col-span-4 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto rounded-lg shadow-sm">
          <AnalysisCatalogPanel
            fileId={fileId}
            qualityVersion={resolvedQv}
            selectedMethod={selectedMethod}
            onMethodSelect={setSelectedMethod}
          />
        </div>

        {/* 右侧：环节三 (配置表单) & 环节四 (状态栏) */}
        <div className="col-span-8 flex flex-col gap-6">
          {/* 🚀 修复点 3：去掉坑爹的 h-[400px]，让表单内容自己撑开高度！ */}
          <div className="w-full">
            <AnalysisConfigForm
              selectedMethod={selectedMethod}
              availableColumns={catalogData?.columns || []}
              onSubmitTask={handleRunAnalysis}
              isSubmitting={runMutation.isPending}
            />
          </div>

          <div className="min-h-[60px]">
            <AnalysisStatusBanner fileId={fileId} qv={resolvedQv} cv={resolvedCv} />
          </div>
        </div>
      </div>

      {/* 环节五：历史报告 Table
          🚀 修复点 4：加上 mt-8，与上方的 Grid 布局彻底拉开安全距离！
      */}
      <div className="mt-10">
        <AnalysisReportsTable
          fileId={fileId}
          qualityVersion={resolvedQv}
          cleaningVersion={resolvedCv}
          onViewDetail={setDrawerVersion}
        />
      </div>

      {/* 环节六：可视化大屏 Drawer */}
      <AnalysisReportDrawer
        fileId={fileId}
        qualityVersion={resolvedQv}
        cleaningVersion={resolvedCv}
        analysisVersion={drawerVersion}
        open={drawerVersion !== null}
        onClose={() => setDrawerVersion(null)}
      />
    </div>
  )
}

export default AnalysisPage
