import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fileApi } from '../services/fileApi'

export const useFiles = (page = 1) => {
  return useQuery({
    queryKey: ['files', page],
    queryFn: () => fileApi.getFiles(page),
    placeholderData: (prev) => prev, // 翻页时保留上一页数据，防止闪烁
  })
}

export const useDeleteFile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fileApi.deleteFile,
    onSuccess: () => {
      // 成功删除后自动刷新列表
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })
}
