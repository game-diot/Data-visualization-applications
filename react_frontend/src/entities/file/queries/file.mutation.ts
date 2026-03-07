// src/entities/file/queries/file.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifyError, notifySuccess } from '@/shared/utils/notify'
import { fileApi } from '../api/file.api'
import { FILE_QUERY_KEYS } from './file.queries'
import { useFileUiStore } from '@/features/files/store/files.store'
// 辅助函数：创建一个指定毫秒的延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export const useUploadFileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, fileName }: { file: File | Blob; fileName?: string }) =>
      fileApi.uploadFiles(file, fileName),

    onSuccess: async () => {
      // 1. 立即弹出成功提示，给用户即时反馈
      notifySuccess('数据集上传成功，后台分析中...')

      // 2. 关键逻辑：等待 1000ms
      // 这一秒钟给后端留出计算质量分数、行数、列数的时间
      await delay(1000)

      // 3. 延迟结束后，再触发数据失效
      // 这样重新获取到的列表数据，stage 大概率已经变成了 quality_done，且带有了分数
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.all })
    },

    onError: (error: Error) => {
      notifyError('上传失败', error.message || '请检查网络或稍后重试')
    },
  })
}

// src/entities/file/queries/file.mutations.ts

export const useRenameFileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => fileApi.updateFile(id, { name }),
    onSuccess: () => {
      notifySuccess('名称更新成功')
      // 全局失效，确保所有列表和详情数据重新拉取最新的名称
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.all })
    },
    onError: (error: any) => {
      notifyError('重命名失败', error.message || '系统错误')
    },
  })
}

// src/entities/file/queries/file.mutations.ts

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient()
  const { closeDeleteModal } = useFileUiStore() // 联动 006 的 Store

  return useMutation({
    mutationFn: (id: string) => fileApi.deleteFile(id),
    onSuccess: () => {
      notifySuccess('数据源已成功移除')
      // 1. 核心动作：使列表失效，强制 React Query 重新从后端拉取剩下的文件
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.all })
      // 2. 交互动作：关闭二次确认弹窗
      closeDeleteModal()
    },
    onError: (error: Error) => {
      notifyError('删除操作失败', error.message || '系统繁忙，请稍后再试')
    },
  })
}
