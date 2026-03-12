// src/features/cleaning/hooks/useCleaningStatusPolling.ts
import { useEffect, useRef } from 'react'
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

  const query = useCleaningStatus(fileId, qualityVersion, (queryInstance) => {
    return queryInstance.state.data?.uiStatus === 'processing' ? 2000 : false
  })

  // 🌟 核心修复 1：使用 useRef 记录上一次的状态
  const currentStatus = query.data?.uiStatus
  const prevStatusRef = useRef(currentStatus)

  useEffect(() => {
    // 🌟 核心修复 2：只有当上一个状态是 processing，且新状态变成了 done/failed 时，才触发雪崩刷新！
    if (
      prevStatusRef.current === 'processing' &&
      (currentStatus === 'success' || currentStatus === 'failed')
    ) {
      queryClient.invalidateQueries({ queryKey: CLEANING_QUERY_KEYS.all })
    }

    // 同步历史状态
    prevStatusRef.current = currentStatus
  }, [currentStatus, queryClient])

  return query
}
