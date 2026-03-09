import { useQuery } from '@tanstack/react-query'
import { qualityApi } from '../api/quality.api'
import {
  mapQualityDtoToVM,
  mapQualityStatusDtoToVM,
  mapQualitySummaryDtoToVM,
} from '../mappers/quality.mapper'

// 扩充 Query Keys
export const QUALITY_QUERY_KEYS = {
  all: ['quality'] as const,
  latest: (fileId: string) => [...QUALITY_QUERY_KEYS.all, 'latest', fileId] as const,
  summary: (fileId: string) => [...QUALITY_QUERY_KEYS.all, 'summary', fileId] as const,
  status: (fileId: string) => [...QUALITY_QUERY_KEYS.all, 'status', fileId] as const,
  // 将 version 纳入缓存键，保证不同版本的数据在内存中是相互独立的
  byVersion: (fileId: string, version: number) =>
    [...QUALITY_QUERY_KEYS.all, 'version', fileId, version] as const,
}

export const useQualityLatest = (fileId: string) => {
  return useQuery({
    queryKey: QUALITY_QUERY_KEYS.latest(fileId),
    queryFn: async () => {
      const dto = await qualityApi.getLatestQuality(fileId)
      return mapQualityDtoToVM(dto) // 送入净水器
    },
    enabled: !!fileId,
    staleTime: 1000 * 60 * 5, // 报告内容短时间内不会变，缓存 5 分钟
  })
}

export const useQualityByVersion = (fileId: string, version: number | null) => {
  return useQuery({
    queryKey: QUALITY_QUERY_KEYS.byVersion(fileId, version as number),
    queryFn: async () => {
      const dto = await qualityApi.getQualityByVersion(fileId, version as number)
      // 完美复用环节一的“净水器”
      return mapQualityDtoToVM(dto)
    },
    // 只有当 fileId 存在，并且明确指定了具体的版本号时，才发起请求
    enabled: !!fileId && version !== null && version > 0,
    // 历史版本永远不会变，设置无限缓存时间 (Infinity)
    staleTime: Infinity,
  })
}

export const useQualitySummary = (fileId: string) => {
  return useQuery({
    queryKey: QUALITY_QUERY_KEYS.summary(fileId),
    queryFn: async () => {
      const dto = await qualityApi.getQualitySummary(fileId)
      return mapQualitySummaryDtoToVM(dto)
    },
    enabled: !!fileId,
  })
}

// src/entities/quality/queries/quality.queries.ts

export const useQualityStatus = (
  fileId: string,
  // 允许外部传入数字、false，或者一个动态计算的函数
  refetchInterval?: number | false | ((query: any) => number | false),
) => {
  return useQuery({
    queryKey: QUALITY_QUERY_KEYS.status(fileId),
    queryFn: async () => {
      const dto = await qualityApi.getQualityStatus(fileId)
      return mapQualityStatusDtoToVM(dto)
    },
    enabled: !!fileId,
    // ⬇️ 将轮询配置真正注入到 React Query 中
    refetchInterval,
  })
}
