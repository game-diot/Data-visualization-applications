import { useQuery } from '@tanstack/react-query'
import { analysisApi } from '../api/analysis.api'
import { mapCatalogDtoToVM } from '../mappers/analysis.mapper'

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
