import type { UnifiedTaskStatus } from '@/shared/types/status'

// 1. 列表页单个数据集的视图模型 (精简、直接可展示)
export interface DatasetVM {
  id: string
  name: string
  sizeFormatted: string
  extension: string
  stage: string
  uiStatus: UnifiedTaskStatus
  errorMessage?: string
  uploadedAtFormatted: string
}

// 2. 列表页整体返回的视图模型 (用于供 Table 消费)
export interface DatasetListVM {
  data: DatasetVM[]
  total: number
}

// 3. 详情页前端干净的视图模型 (继承基础属性，增加物理统计与业务流转状态)
export interface DatasetDetailVM extends DatasetVM {
  totalRows: string // 例如："10,234"
  totalColumns: string // 例如："5"
  qualityScore: number // 兜底为 0 或具体分数
  latestQualityVersion: number | null
  flowStatus: {
    quality: 'pending' | 'done'
    cleaning: 'pending' | 'done'
    analysis: 'pending' | 'done'
  }
}
