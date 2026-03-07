import type { UnifiedTaskStatus } from '@/shared/types/status'

export interface DatasetVM {
  id: string
  name: string
  sizeFormatted: string
  extension: string
  stage: string
  uiStatus: UnifiedTaskStatus
  isDeleted: boolean
  errorMessage?: string
  uploadedAtFormatted: string
}

export interface DatasetListVM {
  data: DatasetVM[]
  total: number
}

// 详情页前端干净的视图模型
export interface DatasetDetailVM extends DatasetVM {
  totalRows: string // 格式化为 "10,234"
  totalColumns: string
  qualityScore: number // 兜底为 0 或具体分数
  latestQualityVersion: number | null
  flowStatus: {
    quality: 'pending' | 'done'
    cleaning: 'pending' | 'done'
    analysis: 'pending' | 'done'
  }
}
