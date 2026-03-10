// src/features/cleaning/hooks/useCleaningStatusPolling.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useCleaningStatus,
  CLEANING_QUERY_KEYS,
} from '@/entities/cleaning/queries/cleaning.queries'

/**
 * 带有智能轮询与联动刷新能力的 Cleaning Status Hook
 */
export const useCleaningStatusPolling = (fileId: string, qualityVersion: number | null) => {
  const queryClient = useQueryClient()

  // 1. 调用环节一写好的基础 Status Query，并动态注入轮询参数
  const query = useCleaningStatus(fileId, qualityVersion, (queryInstance) => {
    // React Query v5: 只有当推导出的状态是 'processing' 时，才每秒轮询一次！
    return queryInstance.state.data?.uiStatus === 'processing' ? 1000 : false
  })

  // 2. 监听状态突变，触发“雪崩式刷新”
  useEffect(() => {
    // 当轮询发现状态终于变成 'success' 时
    if (query.data?.uiStatus === 'success') {
      // 触发全局失效，让下方的“报告列表 (Reports)”和“活跃会话 (Session)”自动去拿新数据
      queryClient.invalidateQueries({
        queryKey: CLEANING_QUERY_KEYS.all, // 为了保证数据绝对一致，也可以偷懒刷新所有 cleaning 相关的 query
      })

      // 也可以更精准地只刷新即将到来的 环节六（历史报告列表）
      // queryClient.invalidateQueries({ queryKey: CLEANING_QUERY_KEYS.reports(fileId) });
    }
  }, [query.data?.uiStatus, fileId, queryClient])

  return query
}
