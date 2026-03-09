// src/entities/quality/types/quality.types.ts

export interface ColumnTypeVM {
  columnName: string
  dtype: string
  isNumeric: boolean
}

export interface AnomalyDetailVM {
  key: string // 供 AntD Table 渲染使用的唯一 key (通常是 row + column)
  row: number
  column: string
  displayValue: string // 将 value: any 安全地转为字符串展示
  type: string
  reason: string
}

export interface QualityReportVM {
  fileId: string
  version: number
  reportTimeFormatted: string // e.g., "2026-03-07 17:00:00"

  rowCountFormatted: string
  columnCount: number
  qualityScore: number

  missing: {
    totalCells: number
    missingRateFormatted: string
    byColumn: Record<string, number>
    columnsWithMissing: string[]
  }

  duplicates: {
    totalRows: number
    duplicateRateFormatted: string
    rows: number[] // 后续在 UI 组件做分页展示
  }

  anomalies: {
    total: number
    byColumn: Record<string, number>
    details: AnomalyDetailVM[] // 经过安全处理的异常详情列表
  }

  columnTypes: ColumnTypeVM[]
}

// --- 环节二：Summary & Status VM ---

// 专为 AntD Badge/Tag 等 UI 组件设计的语义化状态
export type QualityUIStatus = 'default' | 'processing' | 'success' | 'error'

export interface QualityStatusVM {
  updatedAtFormatted: string
  hasResult: boolean
  stage: string // 保留原始 stage 备用
  message: string
  uiStatus: QualityUIStatus // 核心：经过 Mapper 洗净的 UI 直接可用状态
}

export interface QualitySummaryVM {
  fileId: string
  latestVersion: number
  qualityScore: number
  missingRateFormatted: string // "0.00%"
  duplicateRateFormatted: string // "0.00%"
  totalRowsFormatted: string // "1,024"
  totalColumns: number
  analyzedAtFormatted: string // "2026-03-07 16:14"
}
