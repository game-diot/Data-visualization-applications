// src/entities/quality/dto/quality.dto.ts

export interface IAnomalyDetailDTO {
  row: number
  column: string
  value: any
  type: string
  reason: string
}

export interface IQualityAnalysisResultDTO {
  file_id: string
  row_count: number
  column_count: number
  quality_score: number
  missing: {
    total_missing_cells: number
    missing_rate: number
    by_column: Record<string, number>
    columns_with_missing: string[]
  }
  duplicates: {
    total_duplicate_rows: number
    unique_duplicate_groups: number
    duplicate_rate: number
    rows: number[] // 修正为数字数组
  }
  anomalies: {
    total: number
    by_type: Record<string, number>
    by_column: Record<string, number>
    details: IAnomalyDetailDTO[]
  }
  types: Record<string, string>
}

// 核心：暴露给 API 的最外层响应结构
export interface QualityReportDTO {
  fileId: string
  version: number
  snapshot: IQualityAnalysisResultDTO
  createdAt: string // HTTP 传输过来通常是 ISO 字符串
  updatedAt: string
}

// --- 环节二：Summary & Status DTO ---

export interface QualitySummaryDTO {
  fileId: string
  latestVersion: number
  qualityScore: number
  missingRate: number
  duplicateRate: number
  totalRows: number
  totalColumns: number
  analyzedAt: string | Date
}

export interface QualityStatusDTO {
  updatedAt: string
  hasResult: boolean
  stage: string // 'uploaded' | 'quality_pending' | 'quality_analyzing' | 'quality_done' | 'quality_failed' 等
  message: string
}

// src/entities/quality/dto/quality.dto.ts
export interface QualityRetryReqDTO {
  forceRefresh: boolean
}
