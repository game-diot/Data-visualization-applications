// src/entities/cleaning/mappers/cleaning.mapper.ts
import type {
  CleaningSessionDTO,
  CleaningStatusResponseDTO,
  DiffItemDTO,
  ModificationRecordDTO,
} from '../dto/cleaning.dto'
import type {
  CleaningSessionVM,
  CleaningStatusVM,
  CleaningUIStatus,
  DiffItemVM,
  ModificationRecordVM,
} from '../types/cleaning.types'

import type { CleaningReportListResDTO, CleaningReportDetailDTO } from '../dto/cleaning.dto'
import type { CleaningReportItemVM, CleaningReportDetailVM } from '../types/cleaning.types'

// ...保留之前的
export const mapCleaningStatusDtoToVM = (dto: CleaningStatusResponseDTO): CleaningStatusVM => {
  // 1. 推导 UI 状态 (State Machine)
  let uiStatus: CleaningUIStatus = 'no_session'
  let statusMessage = '等待创建清洗会话'

  const hasSession = !!dto.session
  const isRunning =
    dto.currentTask !== null || ['running', 'pending'].includes(dto.latestTask?.status || '')
  const hasFailed = dto.latestTask?.status === 'failed'
  const hasSuccessReport = !!dto.latestReport

  if (!hasSession) {
    uiStatus = 'no_session'
  } else if (isRunning) {
    uiStatus = 'processing'
    statusMessage = '数据清洗中...'
  } else if (hasFailed) {
    uiStatus = 'failed'
    statusMessage = dto.latestTask?.errorMessage || '清洗任务执行失败'
  } else if (hasSuccessReport) {
    uiStatus = 'success'
    statusMessage = `已完成清洗 (v${dto.latestReport?.cleaningVersion})`
  } else {
    // 有 session，但没跑过任务，或者没产出报告
    uiStatus = 'draft'
    statusMessage = '配置规则并准备清洗'
  }

  // 2. 格式化 Report Summary
  let summaryFormatted = null
  if (dto.latestReport?.summary) {
    const sum = dto.latestReport.summary
    summaryFormatted = {
      rowsBefore: sum.rowsBefore.toLocaleString(),
      rowsAfter: sum.rowsAfter.toLocaleString(),
      cellsModified: sum.cellsModified.toLocaleString(),
      rulesAppliedText: sum.rulesApplied.length > 0 ? sum.rulesApplied.join(', ') : '无',
      isReduced: sum.rowsRemoved > 0 || sum.columnsRemoved > 0,
    }
  }

  // 3. 产出防腐后的 VM
  return {
    fileId: dto.fileId,
    qualityVersion: dto.qualityVersion,
    uiStatus,
    statusMessage,
    hasActiveSession: hasSession,
    sessionId: dto.session?.sessionId || null,
    hasLatestReport: hasSuccessReport,
    latestCleaningVersion: dto.latestReport?.cleaningVersion || null,
    summaryFormatted,
    errorMessage: dto.latestTask?.errorMessage || null,
  }
}

export const mapCleaningSessionDtoToVM = (dto: CleaningSessionDTO): CleaningSessionVM => {
  return {
    sessionId: dto._id, // 🛡️ 防腐隔离：UI 层绝对看不到 _id
    fileId: dto.fileId,
    qualityVersion: dto.qualityVersion,
    latestCleaningVersion: dto.latestCleaningVersion || 0,
    status: dto.status || 'draft',
    // 如果存在 lockedAt 且不为空，则认为已锁定（正在运行或已完成）
    isLocked: !!dto.lockedAt,
    createdAtFormatted: dto.createdAt
      ? new Date(dto.createdAt).toLocaleString('zh-CN')
      : '未知时间',
  }
}

// 工具：安全转字符串
const safeStr = (val: any) => (val === null || val === undefined ? '空(null)' : String(val))

const mapDiffItemDtoToVM = (dto: DiffItemDTO): DiffItemVM => {
  let opText = '未知操作'
  let targetText = `行 ${dto.rowId}`
  let changeDescription = '-'

  switch (dto.op) {
    case 'update_cell':
      opText = '修改内容'
      targetText = `行 ${dto.rowId}，列 [${dto.column}]`
      changeDescription = `${safeStr(dto.before)} ➔ ${safeStr(dto.after)}`
      break
    case 'delete_row':
      opText = '删除行'
      targetText = `行 ${dto.rowId}`
      changeDescription = '数据已标记为删除'
      break
    case 'insert_row':
      opText = '插入行'
      targetText = `行 ${dto.rowId}`
      changeDescription = '新增一行数据'
      break
  }

  return { op: dto.op, opText, targetText, changeDescription }
}

export const mapModificationRecordDtoToVM = (dto: ModificationRecordDTO): ModificationRecordVM => {
  const diffs = (dto.diffList || []).map(mapDiffItemDtoToVM)

  return {
    recordId: dto._id,
    sessionId: dto.sessionId,
    isConsumed: !!dto.consumed,
    consumedStatusText: dto.consumed ? '已被清洗任务应用' : '待应用',
    createdAtFormatted: dto.createdAt
      ? new Date(dto.createdAt).toLocaleString('zh-CN')
      : '未知时间',
    diffs,
    diffCount: diffs.length,
  }
}

export const mapModificationListDtoToVM = (
  dtos: ModificationRecordDTO[],
): ModificationRecordVM[] => {
  if (!Array.isArray(dtos)) return []
  return dtos.map(mapModificationRecordDtoToVM)
}

export const mapReportListDtoToVM = (dto: CleaningReportListResDTO): CleaningReportItemVM[] => {
  if (!dto || !Array.isArray(dto.reports)) return []

  return dto.reports.map((r) => ({
    id: r.reportId || (r as any).id || '',
    cleaningVersion: r.cleaningVersion,
    versionLabel: `V${r.cleaningVersion}`,
    createdAtFormatted: r.createdAt ? new Date(r.createdAt).toLocaleString('zh-CN') : '-',
    rulesAppliedText: r.summary?.rulesApplied?.join(', ') || '无',
    rowsReduced: r.summary?.rowsRemoved || 0,
    cellsModified: r.summary?.cellsModified || 0,
    hasAsset: !!r.hasAsset,
  }))
}

// 内部工具：格式化字节
const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const mapReportDetailDtoToVM = (dto: CleaningReportDetailDTO): CleaningReportDetailVM => {
  const sum = dto.summary || {}
  // 🚨 核心防腐：安全提取混杂了 snake_case 的深层指标
  const metrics = dto.diffSummary?.byRule?.metrics || {}

  return {
    cleaningVersion: dto.cleaningVersion,
    createdAtFormatted: dto.createdAt ? new Date(dto.createdAt).toLocaleString('zh-CN') : '',

    compareRows: `${sum.rowsBefore || 0} ➔ ${sum.rowsAfter || 0}`,
    compareColumns: `${sum.columnsBefore || 0} ➔ ${sum.columnsAfter || 0}`,
    userActionsCount: sum.userActionsApplied || 0,

    diffMetrics: {
      // 兼容可能出现的 Python 蛇形命名
      missingFilled: metrics.missing?.filled_cells ?? 0,
      duplicateRemoved: metrics.deduplicate?.removed_rows ?? 0,
      typeCastCols: metrics.type_cast?.converted_cols || [],
    },

    assetInfo: dto.cleanedAsset
      ? {
          format: (dto.cleanedAsset.format || 'unknown').toUpperCase(),
          path: dto.cleanedAsset.path,
          sizeFormatted: formatBytes(dto.cleanedAsset.sizeBytes),
        }
      : null,

    logs: dto.logs || [],
  }
}
