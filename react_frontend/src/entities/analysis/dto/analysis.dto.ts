// ==========================================
// 001 契约镜像 (DTO) - 严格映射后端真实的返回
// ==========================================
export interface ColumnProfileDTO {
  name: string
  dtype: 'numeric' | 'categorical' | 'datetime' | 'unknown' | string
}
export const ANALYSIS_TASK_STATUS = ['pending', 'running', 'success', 'failed'] as const

export type AnalysisTaskStatus = (typeof ANALYSIS_TASK_STATUS)[number]

export const ANALYSIS_TASK_STAGE = [
  'received',
  'load',
  'validate',
  'process',
  'export',
  'done',
  'unknown',
] as const

export type AnalysisTaskStage = (typeof ANALYSIS_TASK_STAGE)[number]

export interface CatalogComputedItemDTO {
  type: string // 'descriptive', 'correlation', 'group_compare' 等
  name: string
  description: string
  enabled: boolean
  reason?: string
  requirements: Record<string, any> // 前端 UI 不直接用，留给 Mapper 过滤
}

export interface AnalysisCatalogResDTO {
  fileId: string
  qualityVersion: number
  columns: ColumnProfileDTO[]
  selectedColumns: string[] | null
  catalog: CatalogComputedItemDTO[]
}

export interface AnalysisRunReqDTO {
  qualityVersion: number
  cleaningVersion: number
  input: 'cleaned' | 'raw'
  dataSelection: any
  analysisConfig: any
}

export interface AnalysisStatusResDTO {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  currentTask: AnalysisReportSummaryDTO | null
  latestTask: AnalysisReportSummaryDTO | null
  latestReport: any | null
}

export interface AnalysisReportSummaryDTO {
  _id?: string
  id?: string
  status: AnalysisTaskStatus
  stage: AnalysisTaskStage
  analysisVersion: number
  createdAt: string
  errorMessage?: string | null
  summary: {
    analysis_type: string
    input_shape?: { rows: number; cols: number }
    selected_shape?: { rows: number; cols: number }
    [key: string]: any
  }
}

export interface AnalysisReportsListResDTO {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  reports: AnalysisReportSummaryDTO[]
}

export interface AnalysisChartDTO {
  id: string // 配合上面的 chartId，必须有唯一标识
  type: 'histogram' | 'bar' | 'heatmap' | 'table'
  title: string
  data: any // 原始 ECharts 需要的数据
  meta: any

  // 🚀 新增：AI 洞察的永久资产存储字段
  aiInsight?: string | null

  // 🚀 新增（可选增强）：AI 生成状态，防止用户在最终报告页疯狂点击重复生成
  aiStatus?: 'idle' | 'generating' | 'success' | 'failed'
}

export interface AnalysisReportDetailDTO {
  fileId: string
  analysisVersion: number
  summary: {
    analysis_type: string
    input_shape: { rows: number; cols: number }
    selected_shape: { rows: number; cols: number }
    selected_columns: string[]
    key_metrics: any
  }
  charts: AnalysisChartDTO[]
  logs: string[]
  warnings?: string[]
  createdAt: string
}
