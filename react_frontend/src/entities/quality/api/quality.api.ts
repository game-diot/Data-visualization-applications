import { httpClient } from '@/shared/http/client'
import type {
  QualityReportDTO,
  QualityRetryReqDTO,
  QualityStatusDTO,
  QualitySummaryDTO,
} from '../dto/quality.dto'

export const qualityApi = {
  getLatestQuality: async (fileId: string): Promise<QualityReportDTO> => {
    // httpClient 拦截器会自动剥离 status, code, message，只返回 data
    const response = await httpClient.get(`/quality/${fileId}`)
    return response as unknown as QualityReportDTO
  },
  getQualityByVersion: async (fileId: string, version: number): Promise<QualityReportDTO> => {
    const response = await httpClient.get(`/quality/${fileId}/version/${version}`)
    return response as unknown as QualityReportDTO
  },
  getQualitySummary: async (fileId: string): Promise<QualitySummaryDTO> => {
    const response = await httpClient.get(`/quality/${fileId}/summary`)
    return response as unknown as QualitySummaryDTO
  },

  getQualityStatus: async (fileId: string): Promise<QualityStatusDTO> => {
    const response = await httpClient.get(`/quality/${fileId}/status`)
    return response as unknown as QualityStatusDTO
  },

  retryQualityAnalysis: async (fileId: string, data: QualityRetryReqDTO): Promise<void> => {
    // 只有状态码，没有返回 data，直接 void 即可
    await httpClient.post(`/quality/${fileId}/retry`, data)
  },
}
