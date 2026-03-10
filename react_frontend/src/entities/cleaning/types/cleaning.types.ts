// src/entities/cleaning/types/cleaning.types.ts

// 核心：推导出的前端绝对 UI 状态
export type CleaningUIStatus =
  | 'no_session' // 还没创建会话（引导去创建）
  | 'draft' // 会话已创建，等待用户配置和触发
  | 'processing' // 正在清洗中（触发轮询）
  | 'success' // 刚刚清洗成功，或已有最新报告
  | 'failed' // 清洗任务报错

export interface CleaningStatusVM {
  fileId: string
  qualityVersion: number

  // 综合推导出的 UI 状态与提示文本
  uiStatus: CleaningUIStatus
  statusMessage: string

  // Session 级信息
  hasActiveSession: boolean
  sessionId: string | null

  // Report 级信息（用于摘要卡片展示）
  hasLatestReport: boolean
  latestCleaningVersion: number | null

  // 针对 UI 渲染洗净的数据结构
  summaryFormatted: {
    rowsBefore: string
    rowsAfter: string
    cellsModified: string
    rulesAppliedText: string
    isReduced: boolean // 是否有数据被删减
  } | null

  errorMessage: string | null
}

export interface CleaningSessionVM {
  sessionId: string // 将 _id 语义化为 sessionId
  fileId: string
  qualityVersion: number
  latestCleaningVersion: number
  status: string
  isLocked: boolean // 方便前端判断是否还能修改规则
  createdAtFormatted: string
}

// 单个微小动作的 UI 模型
export interface DiffItemVM {
  op: string // 'update_cell' | 'delete_row'
  opText: string // 例如："更新单元格", "删除行"
  targetText: string // 例如："第 0 行, Store_Sales 列"
  changeDescription: string // 例如："66490 ➔ 70000" 或 "已删除"
}

// 批量提交记录的 UI 模型
export interface ModificationRecordVM {
  recordId: string
  sessionId: string
  isConsumed: boolean
  consumedStatusText: string // '已生效' | '待应用'
  createdAtFormatted: string
  diffs: DiffItemVM[]
  diffCount: number // 包含几个操作
}

// src/entities/cleaning/types/cleaning.types.ts
// ...保留之前的代码

export interface CleaningReportItemVM {
  id: string
  cleaningVersion: number
  versionLabel: string // "V1", "V2"
  createdAtFormatted: string
  rulesAppliedText: string
  rowsReduced: number // 减少了多少行
  cellsModified: number
  hasAsset: boolean
}

export interface CleaningReportDetailVM {
  cleaningVersion: number
  createdAtFormatted: string

  // 核心对比指标
  compareRows: string // "896 ➔ 895"
  compareColumns: string
  userActionsCount: number

  // 深层规则执行结果提取
  diffMetrics: {
    missingFilled: number
    duplicateRemoved: number
    typeCastCols: string[]
  }

  // 产物信息
  assetInfo: {
    format: string
    path: string
    sizeFormatted: string // "22.00 KB"
  } | null

  // 纯净的日志列表
  logs: string[]
}
