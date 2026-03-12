import React from 'react'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { Alert, Skeleton, Result, Button } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
// 复用我们在 shared/entities 写好的文件详情 Hook
import { useFileDetail } from '@/entities/file/queries/file.queries'
import { AnalysisHeader } from '../components/AnalysisHeader'

export const AnalysisPage: React.FC = () => {
  const { fileId } = useParams({ strict: false }) as { fileId: string }
  const searchParams = useSearch({ strict: false }) as { qv?: number; cv?: number }
  const navigate = useNavigate()

  // 1. 获取全局文件状态
  const { data: fileDetail, isLoading, error } = useFileDetail(fileId)

  // 2. 兜底渲染 (Loading & 异常断言)
  if (!fileId) return <Alert message="缺失 File ID" type="error" className="m-6" />
  if (isLoading)
    return (
      <div className="p-8">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    )
  if (error || !fileDetail) return <Alert message="获取文件信息失败" type="error" className="m-6" />

  // 3. 版本决议 (URL 优先，否则 fallback 到文件最新版本)
  const resolvedQv = searchParams.qv ?? fileDetail.latestQualityVersion ?? 0
  const resolvedCv = searchParams.cv ?? fileDetail.latestCleaningVersion ?? 0

  // 4. 防御性 UI 拦截：如果根本没有清洗过，或者解析出来的 cleaningVersion 无效
  const isCleaningDone = fileDetail.flowStatus?.cleaning === 'done' && resolvedCv > 0

  if (!isCleaningDone) {
    return (
      <div className="p-12 bg-white m-6 rounded-lg shadow-sm border border-slate-200 mt-20">
        <Result
          status="warning"
          title="前置依赖未就绪 (Missing Cleaned Asset)"
          subTitle="智能分析模块必须基于结构化且干净的【清洗产物】运行。系统检测到当前文件尚未完成数据清洗，或无有效的 Cleaning Version。"
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

  // 5. 正常渲染工作台骨架 (为后续环节预留占位坑位)
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* 环节一：上下文锁定 */}
      <AnalysisHeader
        fileDetail={fileDetail}
        qualityVersion={resolvedQv}
        cleaningVersion={resolvedCv}
      />

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧：特征目录区 (预留给环节二: Catalog Panel) */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
            [占位] 环节二：Catalog 列画像
          </div>
        </div>

        {/* 右侧：配置与执行区 (预留给环节二/三/四) */}
        <div className="col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 h-48 border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
            [占位] 环节二：Method Cards Panel (分析能力矩阵)
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 h-64 border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
            [占位] 环节三 & 环节四：动态表单 Config Form & 运行状态 Banner
          </div>
        </div>
      </div>

      {/* 底部：历史报告区 (预留给环节五: Reports Table) */}
      <div className="mt-6 bg-white rounded-lg shadow-sm p-4 h-64 border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
        [占位] 环节五：Analysis Reports 历史列表
      </div>
    </div>
  )
}
