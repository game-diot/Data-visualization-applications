import { useMutation, useQueryClient } from '@tanstack/react-query'
import { qualityApi } from '../api/quality.api'
import { QUALITY_QUERY_KEYS } from './quality.queries'
import { notifySuccess, notifyError } from '@/shared/utils/notify'

export const useQualityRetryMutation = (fileId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (forceRefresh: boolean = true) =>
      qualityApi.retryQualityAnalysis(fileId, { forceRefresh }),
    onSuccess: () => {
      notifySuccess('已重新提交质量检测任务')

      // 核心战术：动作成功后，只需让 status 失效。
      // 这会让 status 瞬间变为 'processing'，从而唤醒下方的动态轮询！
      queryClient.invalidateQueries({
        queryKey: QUALITY_QUERY_KEYS.status(fileId),
      })
    },
    onError: (error: Error) => {
      notifyError('提交重试失败', error.message)
    },
  })
}
