// ==========================================
// 001 契约镜像 (DTO) - 严格映射后端真实的返回
// ==========================================
export interface ColumnProfileDTO {
  name: string
  dtype: 'numeric' | 'categorical' | 'datetime' | 'unknown' | string
}

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
