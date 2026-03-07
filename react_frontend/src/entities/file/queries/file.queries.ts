import { useQuery } from '@tanstack/react-query'
import { fileApi } from '../api/file.api'
import { mapFileDetailDtoToVM, mapFileListDTOToVM } from '../mappers/file.mappers'
export const FILE_QUERY_KEYS = {
  all: ['files'] as const,
  list: (params: any) => [...FILE_QUERY_KEYS.all, 'list', params] as const,
}

export const useFilesList = (params: {
  page: number
  pageSize: number
  query?: string
  stage?: string
}) => {
  return useQuery({
    queryKey: FILE_QUERY_KEYS.list(params),
    queryFn: async () => {
      const dto = await fileApi.getFiles(params)
      return mapFileListDTOToVM(dto)
    },
    refetchOnWindowFocus: false,
  })
}
export const useFileDetail = (id: string) => {
  return useQuery({
    queryKey: [...FILE_QUERY_KEYS.all, 'detail', id],
    queryFn: async () => {
      const dto = await fileApi.getFileDetail(id)
      return mapFileDetailDtoToVM(dto)
    },
    enabled: !!id, // 只有当 id 存在时才发请求
  })
}
