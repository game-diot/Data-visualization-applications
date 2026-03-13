import { mapCatalogDtoToVM, mapReportListDtoToVM } from '../mappers/analysis.mapper'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analysisApi } from '../api/analysis.api'
import type { AnalysisRunReqDTO } from '../dto/analysis.dto'
import { notifyError, notifySuccess } from '@/shared/utils/notify'
import { useEffect, useRef } from 'react'

export const useAnalysisCatalog = (
  fileId: string,
  qualityVersion: number,
  selectedColumns?: string,
) => {
  return useQuery({
    queryKey: ['analysis', 'catalog', fileId, qualityVersion, selectedColumns],
    queryFn: async () => {
      const res = await analysisApi.getCatalog(fileId, qualityVersion, selectedColumns)
      return mapCatalogDtoToVM(res) // 🌟 返回干净的 VM
    },
    enabled: !!fileId && !!qualityVersion, // 依赖环节一锁定的版本
    staleTime: 5 * 60 * 1000, // 列结构短时间不会变，缓存 5 分钟
  })
}

// 🌟 1. 极其聪明的轮询 Hook (心跳侦测)
export const useAnalysisStatusPolling = (fileId: string, qv: number, cv: number) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['analysis', 'status', fileId, qv, cv],
    queryFn: () => analysisApi.getStatus(fileId, qv, cv),
    enabled: !!fileId && !!qv && !!cv,
    // 【核心策略】：如果存在正在运行的 currentTask，就保持每秒拉取1次；否则休眠 (false)
    refetchInterval: (query) => {
      const status = query.state.data?.currentTask?.status
      return status === 'pending' || status === 'running' ? 2000 : false
    },
  })

  // 状态转移监听：当任务从“运行中”变为“完成”或“失败”时，触发雪崩效应！
  const currentTaskStatus = query.data?.latestTask?.status
  const prevStatusRef = useRef(currentTaskStatus)

  useEffect(() => {
    if (
      prevStatusRef.current === 'running' &&
      (currentTaskStatus === 'success' || currentTaskStatus === 'failed')
    ) {
      // 任务刚刚结束！立刻刷新下游的报告列表，保证用户第一时间看到结果！
      queryClient.invalidateQueries({ queryKey: ['analysis', 'reports', fileId, qv, cv] })
    }
    prevStatusRef.current = currentTaskStatus
  }, [currentTaskStatus, fileId, qv, cv, queryClient])

  return query
}

// 🌟 2. 触发运行的 Mutation (点火器)
export const useAnalysisRunMutation = (fileId: string, qv: number, cv: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AnalysisRunReqDTO) => analysisApi.runTask(fileId, payload),
    onSuccess: () => {
      notifySuccess('分析任务已下发，正在调度资源...')
      // 任务下发成功后，强制立即使 status 缓存失效
      // 下一次请求会立刻拿到 currentTask: pending，从而点燃上面的 refetchInterval 轮询发条！
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['analysis', 'status', fileId, qv, cv] })
        // 🚀 2. 任务一旦提交成功，立刻作废旧的状态缓存和报告缓存！
        // 这会让 StatusBanner 立刻开始轮询，并让 Table 尝试拉取 (如果后端跑得够快，甚至能瞬间刷出新数据)

        queryClient.invalidateQueries({ queryKey: ['analysis', 'reports', fileId, qv, cv] })
      }, 500) // 留出 500ms 给 MongoDB 写事务，防止幽灵读
    },
    onError: (error: Error) => notifyError('任务下发失败', error.message),
  })
}
export const useAnalysisReports = (fileId: string, qv: number, cv: number) => {
  return useQuery({
    queryKey: ['analysis', 'reports', fileId, qv, cv],
    queryFn: async () => {
      const res = await analysisApi.getReports(fileId, qv, cv)
      return mapReportListDtoToVM(res) // 返回绝对干净的表格数据
    },
    enabled: !!fileId && !!qv && !!cv,
    staleTime: 30 * 1000,
  })
}

export const useAnalysisReportDetail = (
  fileId: string,
  qv: number,
  cv: number,
  av: number | null,
) => {
  return useQuery({
    queryKey: ['analysis', 'report-detail', fileId, qv, cv, av],
    queryFn: () => analysisApi.getReportDetail(fileId, qv, cv, av!),
    enabled: !!fileId && !!qv && !!cv && av !== null, // 仅当 Drawer 传入 av 时才发请求
    staleTime: Infinity, // 历史快照是不可变的 (Immutable)，一旦拉取永久缓存！
  })
}
