import { useMutation, useQueryClient } from '@tanstack/react-query'

import { notify, notifyError, notifySuccess } from '@/shared/utils/notify'

import { fileApi } from '../api/file.api'
import { FILE_QUERY_KEYS } from './file.queries'

export const useUploadFileMutation = () => {
  const queryCLient = useQueryClient()
  return useMutation({
    // ⬇️ 注意看这里：去掉了大括号，直接返回 API 调用的结果（Promise）
    mutationFn: ({ file, fileName }: { file: File | Blob; fileName?: string }) =>
      fileApi.uploadFiles(file, fileName),
    onSuccess: () => {
      queryCLient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.all })
    },
    onError: (error: any) => {},
  })
}
export const useRenameFileMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => fileApi.updateFile(id, name),
    onSuccess: () => {
      notifySuccess('重命名成功')

      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.all })
    },
    onError: (error: any) => notifyError('重命名失败', error.message || '请检查网络或稍后重试'),
  })
}

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fileApi.deleteFile(id),
    onSuccess: () => {
      notifySuccess('数据集已删除')
      queryClient.invalidateQueries({ queryKey: FILE_QUERY_KEYS.all })
    },
    onError: (error: any) => notifyError('删除失败', error.message || '删除失败'),
  })
}
