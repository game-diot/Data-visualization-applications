// --- 002 API (src/entities/analysis/api/analysis.api.ts) ---
import { httpClient } from '@/shared/http/client'
import type {
  AnalysisCatalogResDTO,
  AnalysisReportDetailDTO,
  AnalysisReportsListResDTO,
  AnalysisRunReqDTO,
  AnalysisStatusResDTO,
  AnalysisReportSummaryDTO,
} from '../dto/analysis.dto'

export const analysisApi = {
  getCatalog: async (
    fileId: string,
    qv: number,
    selectedCols?: string,
  ): Promise<AnalysisCatalogResDTO> => {
    return httpClient.get(`/analysis/${fileId}/catalog`, {
      params: { qualityVersion: qv, selectedColumns: selectedCols },
    })
  },
  runTask: async (
    fileId: string,
    payload: AnalysisRunReqDTO,
  ): Promise<AnalysisReportSummaryDTO> => {
    return httpClient.post(`/analysis/${fileId}/run`, payload)
  },

  // 状态短轮询
  getStatus: async (fileId: string, qv: number, cv: number): Promise<AnalysisStatusResDTO> => {
    return httpClient.get(`/analysis/${fileId}/status`, {
      params: { qualityVersion: qv, cleaningVersion: cv },
    })
  },
  getReports: async (
    fileId: string,
    qv: number,
    cv: number,
  ): Promise<AnalysisReportsListResDTO> => {
    return httpClient.get(`/analysis/${fileId}/reports`, {
      params: { qualityVersion: qv, cleaningVersion: cv },
    })
  },

  getReportDetail: async (
    fileId: string,
    qv: number,
    cv: number,
    av: number,
  ): Promise<AnalysisReportDetailDTO> => {
    return httpClient.get(`/analysis/${fileId}/reports/${av}`, {
      params: { qualityVersion: qv, cleaningVersion: cv },
    })
  },
}
