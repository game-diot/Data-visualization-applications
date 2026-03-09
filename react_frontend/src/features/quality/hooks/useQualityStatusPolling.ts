// src/features/quality/hooks/useQualityStatusPolling.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useQualityStatus, QUALITY_QUERY_KEYS } from '@/entities/quality/queries/quality.queries'

export const useQualityStatusPolling = (fileId: string) => {
  const queryClient = useQueryClient()

  // ⬇️ 修正：不再尝试修改返回值，而是把函数作为第二个参数传进去
  const query = useQualityStatus(fileId, (query) => {
    // React Query v5 支持传入函数，根据当前的缓存状态动态决定轮询频率
    return query.state.data?.uiStatus === 'processing' ? 1000 : false
  })

  // 监听状态突变，触发“雪崩式刷新”
  useEffect(() => {
    if (query.data?.uiStatus === 'success') {
      queryClient.invalidateQueries({ queryKey: QUALITY_QUERY_KEYS.summary(fileId) })
      queryClient.invalidateQueries({ queryKey: QUALITY_QUERY_KEYS.latest(fileId) })
    }
  }, [query.data?.uiStatus, fileId, queryClient])

  return query
}
