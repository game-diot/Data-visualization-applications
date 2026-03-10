import { useQuery } from '@tanstack/react-query'
import { cleaningApi } from '../api/cleaning.api'
import {
  mapCleaningSessionDtoToVM,
  mapCleaningStatusDtoToVM,
  mapModificationListDtoToVM,
  mapReportDetailDtoToVM,
  mapReportListDtoToVM,
} from '../mappers/cleaning.mapper'

export const CLEANING_QUERY_KEYS = {
  all: ['cleaning'] as const,
  status: (fileId: string, qualityVersion: number) =>
    [...CLEANING_QUERY_KEYS.all, 'status', fileId, qualityVersion] as const,
  activeSession: (fileId: string, qualityVersion: number) =>
    [...CLEANING_QUERY_KEYS.all, 'activeSession', fileId, qualityVersion] as const,
  modification: (fileId: string, sessionId: string) =>
    [...CLEANING_QUERY_KEYS.all, 'modification', fileId, sessionId] as const,
  reports: (fileId: string, qualityVersion: number) =>
    [...CLEANING_QUERY_KEYS.all, 'reports', fileId, qualityVersion] as const,
  reportDetail: (fileId: string, qualityVersion: number, cleaningVersion: number) =>
    [...CLEANING_QUERY_KEYS.all, 'reportDetail', fileId, qualityVersion, cleaningVersion] as const,
}

export const useCleaningStatus = (
  fileId: string,
  qualityVersion: number | null,
  refetchInterval?: number | false | ((query: any) => number | false),
) => {
  return useQuery({
    queryKey: CLEANING_QUERY_KEYS.status(fileId, qualityVersion as number),
    queryFn: async () => {
      const res = await cleaningApi.getCleaningStatus(fileId, qualityVersion as number)
      return mapCleaningStatusDtoToVM(res)
    },
    enabled: !!fileId && qualityVersion !== null && qualityVersion > 0,
    refetchInterval,
  })
}

export const useCleaningActiveSession = (fileId: string, qualityVersion: number | null) => {
  return useQuery({
    queryKey: CLEANING_QUERY_KEYS.activeSession(fileId, qualityVersion as number),
    queryFn: async () => {
      const res = await cleaningApi.getActiveSession(fileId, qualityVersion as number)
      return mapCleaningSessionDtoToVM(res)
    },
    enabled: !!fileId && qualityVersion !== null && qualityVersion > 0,
  })
}

export const useCleaningModifications = (fileId: string, sessionId: string | null) => {
  return useQuery({
    queryKey: CLEANING_QUERY_KEYS.modification(fileId, sessionId as string),
    queryFn: async () => {
      const dto = await cleaningApi.getModifications(fileId, sessionId as string)
      return mapModificationListDtoToVM(dto)
    },
    // 只有在明确了 sessionId 的情况下才去获取修改记录
    enabled: !!fileId && !!sessionId,
  })
}

export const useCleaningReports = (fileId: string, qualityVersion: number | null) => {
  return useQuery({
    queryKey: CLEANING_QUERY_KEYS.reports(fileId, qualityVersion as number),
    queryFn: async () => {
      const dto = await cleaningApi.getReports(fileId, qualityVersion as number)
      return mapReportListDtoToVM(dto)
    },
    enabled: !!fileId && qualityVersion !== null && qualityVersion > 0,
  })
}

export const useCleaningReportDetail = (
  fileId: string,
  qualityVersion: number | null,
  cleaningVersion: number | null,
) => {
  return useQuery({
    queryKey: CLEANING_QUERY_KEYS.reportDetail(
      fileId,
      qualityVersion as number,
      cleaningVersion as number,
    ),
    queryFn: async () => {
      const dto = await cleaningApi.getReportDetail(
        fileId,
        qualityVersion as number,
        cleaningVersion as number,
      )
      return mapReportDetailDtoToVM(dto)
    },
    // 双重护城河：必须有 qVer 且有具体的 cVer 才能请求详情
    enabled: !!fileId && qualityVersion !== null && cleaningVersion !== null && cleaningVersion > 0,
    staleTime: Infinity, // 历史报告详情是不可变快照，直接设置无限缓存
  })
}
