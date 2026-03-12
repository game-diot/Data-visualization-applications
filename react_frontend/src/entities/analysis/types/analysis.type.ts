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
