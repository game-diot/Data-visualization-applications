// src/entities/cleaning/dto/cleaning.dto.ts

export interface CleaningSessionSummaryDTO {
  sessionId: string
  status: string // 后端 TS: 'active' | 'completed' | 'failed', JSON 实际返回: 'running'
}

export interface CleaningTaskSummaryDTO {
  taskId: string
  status: string
  cleaningVersion?: number // 补充 JSON 中出现的字段
  createdAt?: string // 补充 JSON 中出现的字段
  startedAt?: Date
  errorMessage?: string | null
}

export interface CleaningSummaryDTO {
  rowsBefore: number
  rowsAfter: number
  columnsBefore: number
  columnsAfter: number
  rowsRemoved: number
  columnsRemoved: number
  cellsModified: number
  userActionsApplied: number
  rulesApplied: string[]
  missingRateBefore: number
  missingRateAfter: number
  duplicateRateBefore: number
  duplicateRateAfter: number
}

export interface CleaningReportSummaryDTO {
  reportId?: string // JSON 中存在
  cleaningVersion: number
  createdAt: Date | string
  summary: CleaningSummaryDTO
  hasAsset?: boolean
}

export interface CleaningStatusResponseDTO {
  fileId: string
  qualityVersion: number
  session: CleaningSessionSummaryDTO | null
  currentTask: CleaningTaskSummaryDTO | null
  latestTask: CleaningTaskSummaryDTO | null
  latestReport: CleaningReportSummaryDTO | null
}

export interface CleaningSessionDTO {
  _id: string // 🚨 后端 MongoDB 的原始 ID
  fileId: string
  qualityVersion: number
  latestCleaningVersion: number
  status: string // 'draft' | 'running' | ...
  createdAt: string
  updatedAt: string
  lockedAt?: string
  __v?: number
}

export interface CreateSessionReqDTO {
  qualityVersion: number
}

export type DiffOpTypeDTO = 'update_cell' | 'delete_row' | 'insert_row'

export interface DiffItemDTO {
  op: DiffOpTypeDTO
  rowId: string
  column?: string
  before?: any
  after?: any
}

// 提交修改的 Request Body
export interface SubmitModificationsReqDTO {
  sessionId: string
  modifications: DiffItemDTO[]
}

// 单次修改记录的响应结构 (GET 列表和 POST 返回的单项一致)
export interface ModificationRecordDTO {
  _id: string
  sessionId: string
  fileId: string
  diffList: DiffItemDTO[]
  consumed: boolean // 是否已经被后续的清洗任务(run)消耗掉
  createdAt: string
  __v?: number
}

export interface RunCleaningReqDTO {
  sessionId: string
  cleanRules: Record<string, any>
}

export interface RunCleaningResDTO {
  _id: string // taskId
  fileId: string
  sessionId: string
  qualityVersion: number
  cleaningVersion: number
  status: string // 'pending'
  createdAt: string
}

// src/entities/cleaning/dto/cleaning.dto.ts
// ...保留之前的代码

export interface CleaningReportListResDTO {
  fileId: string
  qualityVersion: number
  reports: CleaningReportSummaryDTO[] // 复用环节一的 SummaryDTO
}

export interface CleaningAssetDTO {
  type?: string
  path: string
  format?: string
  sizeBytes?: number
  preview?: any[]
}

export interface CleaningReportDetailDTO {
  fileId: string
  qualityVersion: number
  cleaningVersion: number
  createdAt: string
  taskId: string
  summary: CleaningSummaryDTO
  // 兼容深层蛇形命名的宽松类型
  diffSummary: {
    byRule?: any
    byColumn?: any
  }
  cleanedAsset: CleaningAssetDTO
  logs: string[]
}
