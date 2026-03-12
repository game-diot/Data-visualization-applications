// --- 002 API (src/entities/analysis/api/analysis.api.ts) ---
import { httpClient } from '@/shared/http/client'
import type { AnalysisCatalogResDTO } from '../dto/analysis.dto'

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
}
