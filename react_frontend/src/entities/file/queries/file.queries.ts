import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fileApi, type GetFilesParams } from '../api/file.api'
import { mapFileListDtoToVM, mapFileDtoToVM, mapFileDetailDtoToVM } from '../mappers/file.mappers'

// 集中管理所有的 Query Keys，这是 React Query 的最佳实践
export const FILE_QUERY_KEYS = {
  all: ['files'] as const,
  list: (params: GetFilesParams) => [...FILE_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...FILE_QUERY_KEYS.all, 'detail', id] as const,
}

// 列表查询 Hook
export const useFilesList = (params: GetFilesParams) => {
  return useQuery({
    queryKey: FILE_QUERY_KEYS.list(params),
    queryFn: async () => {
      // 1. 发起请求拿到 DTO
      const dto = await fileApi.getFiles(params)
      // 2. 清洗成 VM 返回给组件
      return mapFileListDtoToVM(dto)
    },
    // 数据集列表不需要切个窗口就频繁刷新，节省请求
    refetchOnWindowFocus: false,
    // 💡 吸收你的防闪烁优化：翻页或搜索时保留上一页数据，直到新数据加载完毕
    placeholderData: keepPreviousData,
  })
}

export const useFileDetail = (fileId: string) => {
  return useQuery({
    // 关键：QueryKey 必须包含 fileId，保证不同文件的缓存互不干扰
    queryKey: FILE_QUERY_KEYS.detail(fileId),
    queryFn: async () => {
      const dto = await fileApi.getFileById(fileId)
      // 经过 Mapper 转化为干净的 VM 供给 UI
      return mapFileDetailDtoToVM(dto)
    },
    // 只要 fileId 存在才发起请求
    enabled: !!fileId,
    // 详情页数据通常不需要频繁自动刷新
    staleTime: 1000 * 60 * 5,
  })
}
