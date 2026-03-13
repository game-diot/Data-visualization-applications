export interface ColumnProfileVM {
  columnName: string
  dataType: string
  isNumeric: boolean
}

export interface AnalysisMethodVM {
  methodType: string
  displayName: string
  description: string
  isAvailable: boolean
  disabledReason: string // 确保必定有字符串，兜底处理
}

export interface AnalysisCatalogVM {
  columns: ColumnProfileVM[]
  methods: AnalysisMethodVM[]
}

export interface AnalysisReportSummaryVM {
  reportId: string
  analysisVersion: number
  analysisType: string
  analysisTypeLabel: string // 翻译后的类型：'相关性分析'
  dataShapeLabel: string // 例如：'使用 895 行, 4 列'
  createdAtFormatted: string
}
