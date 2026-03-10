import { httpClient } from '@/shared/http/client'
import type {
  CleaningReportDetailDTO,
  CleaningReportListResDTO,
  CleaningSessionDTO,
  CleaningStatusResponseDTO,
  CreateSessionReqDTO,
  ModificationRecordDTO,
  RunCleaningReqDTO,
  RunCleaningResDTO,
  SubmitModificationsReqDTO,
} from '../dto/cleaning.dto'

export const cleaningApi = {
  getCleaningStatus: async (
    fileId: string,
    qualityVersion: number,
  ): Promise<CleaningStatusResponseDTO> => {
    const response = await httpClient.get(`/cleaning/${fileId}/status`, {
      params: { qualityVersion },
    })
    return response as unknown as CleaningStatusResponseDTO
  },
  /**
   * 002: 获取指定 qualityVersion 下的活跃会话
   */
  getActiveSession: async (fileId: string, qualityVersion: number): Promise<CleaningSessionDTO> => {
    const response = await httpClient.get(`/cleaning/${fileId}/sessions/active`, {
      params: { qualityVersion },
    })
    return response as unknown as CleaningSessionDTO
  },

  /**
   * 002: 创建新的清洗会话 (后端会自动关闭旧的)
   */
  createSession: async (fileId: string, data: CreateSessionReqDTO): Promise<CleaningSessionDTO> => {
    const response = await httpClient.post(`/cleaning/${fileId}/sessions`, data)
    return response as unknown as CleaningSessionDTO
  },
  /**
   * 002: 提交手工修改意图
   */
  submitModifications: async (
    fileId: string,
    data: SubmitModificationsReqDTO,
  ): Promise<ModificationRecordDTO> => {
    const response = await httpClient.post(`/cleaning/${fileId}/modifications`, data)
    return response as unknown as ModificationRecordDTO
  },

  /**
   * 002: 获取当前会话的手工修改历史
   */
  getModifications: async (fileId: string, sessionId: string): Promise<ModificationRecordDTO[]> => {
    // 根据契约，sessionId 作为 params 传递
    const response = await httpClient.get(`/cleaning/${fileId}/modifications`, {
      params: { sessionId },
    })
    return response as unknown as ModificationRecordDTO[]
  },

  runCleaning: async (fileId: string, data: RunCleaningReqDTO): Promise<RunCleaningResDTO> => {
    const response = await httpClient.post(`/cleaning/${fileId}/run`, data)
    return response as unknown as RunCleaningResDTO
  },

  getReports: async (fileId: string, qualityVersion: number): Promise<CleaningReportListResDTO> => {
    const response = await httpClient.get(`/cleaning/${fileId}/reports`, {
      params: { qualityVersion },
    })
    return response as unknown as CleaningReportListResDTO
  },

  /**
   * 002: 获取某个具体版本的清洗报告详情
   */
  getReportDetail: async (
    fileId: string,
    qualityVersion: number,
    cleaningVersion: number,
  ): Promise<CleaningReportDetailDTO> => {
    const response = await httpClient.get(`/cleaning/${fileId}/reports/${cleaningVersion}`, {
      params: { qualityVersion }, // 按契约携带 qVer
    })
    return response as unknown as CleaningReportDetailDTO
  },
}
