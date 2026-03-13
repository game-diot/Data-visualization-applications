import React, { useEffect } from 'react'
import { Alert, Spin } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { useAnalysisStatusPolling } from '@/entities/analysis/queries/analysis.queries'

interface Props {
  fileId: string
  qv: number
  cv: number
}

export const AnalysisStatusBanner: React.FC<Props> = ({ fileId, qv, cv }) => {
  const queryClient = useQueryClient()

  const { data: statusData, isLoading } = useAnalysisStatusPolling(fileId, qv, cv)

  // =========================================================
  // 🚀 1. 精准提取状态：优先看当前正在执行的任务，如果没有，看最新完成的任务
  // =========================================================
  const activeTask = statusData?.currentTask || statusData?.latestTask
  const currentStatus = activeTask?.status // 推导为 'pending' | 'running' | 'success' | 'failed' | undefined

  // =========================================================
  // 🚀 2. 终极哨兵机制：监听 currentStatus
  // =========================================================
  useEffect(() => {
    // 契约显示成功状态是 'success'
    if (currentStatus === 'success') {
      console.log('🛡️ [StatusBanner] 侦测到分析完成 (success)，正在命令 Table 刷新...')
      queryClient.invalidateQueries({
        queryKey: ['analysis', 'reports', fileId, qv, cv],
      })
    }
  }, [currentStatus, queryClient, fileId, qv, cv])

  // UI 渲染兜底
  if (!statusData || !activeTask) return null

  // 渲染进行中
  if (currentStatus === 'pending' || currentStatus === 'running') {
    return (
      <Alert
        type="info"
        message={
          <span>
            <Spin size="small" className="mr-2" />
            AI 正在全力进行深度分析
            <span className="text-slate-400 ml-1 text-xs">(阶段: {activeTask.stage})</span>...
          </span>
        }
        className="border-blue-200 bg-blue-50"
      />
    )
  }

  // 渲染成功
  if (currentStatus === 'success') {
    return (
      <Alert
        type="success"
        message="分析任务已完成！历史图表已自动更新在下方。"
        showIcon
        closable // 允许用户关掉它，保持界面清爽
      />
    )
  }

  // 渲染失败
  if (currentStatus === 'failed') {
    return (
      <Alert
        type="error"
        message={`分析任务执行失败: ${activeTask.errorMessage || '未知系统异常'}`}
        showIcon
      />
    )
  }

  return null
}
