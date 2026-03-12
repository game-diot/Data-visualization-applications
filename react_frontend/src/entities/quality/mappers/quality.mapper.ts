// src/entities/quality/mappers/quality.mapper.ts
import type { IAnomalyDetailDTO } from '../dto/quality.dto'
import type {
  QualityReportVM,
  ColumnTypeVM,
  AnomalyDetailVM,
  QualitySummaryVM,
  QualityStatusVM,
  QualityUIStatus,
} from '../types/quality.type'
// src/entities/quality/mappers/quality.mapper.ts
import type { QualitySummaryDTO, QualityStatusDTO } from '../dto/quality.dto'

// 1. 整理一个“后置阶段”的黑名单集合
const POST_QUALITY_STAGES = [
  'cleaning_pending',
  'cleaning_processing',
  'cleaning_done',
  'cleaning_failed',
  'analysis_pending',
  'analysis_processing',
  'analysis_done',
  'analysis_failed',
  'ai_pending',
  'ai_generating',
  'ai_done',
  'ai_failed',
]

const formatPercent = (val?: number) => {
  if (typeof val !== 'number') return '0.00%'
  return (val * 100).toFixed(2) + '%'
}

// 安全处理异常值展示
const formatAnomalyValue = (val: any): string => {
  if (val === null || val === undefined) return 'N/A'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

export const mapQualityDtoToVM = (dto: any): QualityReportVM => {
  // 🚨 核心修正：实际的 JSON 数据没有 snapshot 包裹，直接从 dto 读取
  // 为了防止后端以后又加上 snapshot，我们做一个向下兼容的智能感知
  const dataNode = dto.snapshot ? dto.snapshot : dto

  const columnTypes: ColumnTypeVM[] = Object.entries(dataNode.types || {}).map(
    ([colName, dtype]) => ({
      columnName: colName,
      dtype: dtype as string,
      isNumeric: ['int64', 'float64', 'int32', 'float32'].includes((dtype as string).toLowerCase()),
    }),
  )

  const anomalyDetails: AnomalyDetailVM[] = (dataNode.anomalies?.details || []).map(
    (detail: IAnomalyDetailDTO) => ({
      key: `${detail.row}-${detail.column}-${detail.type}`,
      row: detail.row,
      column: detail.column,
      displayValue: formatAnomalyValue(detail.value),
      type: detail.type,
      reason: detail.reason,
    }),
  )

  return {
    // 如果 JSON 里没有 fileId，兼容读取 file_id
    fileId: dto.fileId || dto.file_id || '',
    // 如果 JSON 里没有 version 和时间，给个合理的默认展示
    version: dto.version || 1,
    reportTimeFormatted: dto.createdAt
      ? new Date(dto.createdAt).toLocaleString('zh-CN')
      : '最新分析结果',

    rowCountFormatted: (dataNode.row_count || 0).toLocaleString(),
    columnCount: dataNode.column_count || 0,
    qualityScore: dataNode.quality_score ?? 0,

    missing: {
      totalCells: dataNode.missing?.total_missing_cells || 0,
      missingRateFormatted: formatPercent(dataNode.missing?.missing_rate),
      byColumn: dataNode.missing?.by_column || {},
      columnsWithMissing: dataNode.missing?.columns_with_missing || [],
    },

    duplicates: {
      totalRows: dataNode.duplicates?.total_duplicate_rows || 0,
      duplicateRateFormatted: formatPercent(dataNode.duplicates?.duplicate_rate),
      rows: dataNode.duplicates?.rows || [],
    },

    anomalies: {
      total: dataNode.anomalies?.total || 0,
      byColumn: dataNode.anomalies?.by_column || {},
      details: anomalyDetails,
    },

    columnTypes,
  }
}

// 工具函数：复用环节一的 formatPercent 等...

export const mapQualitySummaryDtoToVM = (dto: QualitySummaryDTO): QualitySummaryVM => {
  return {
    fileId: dto.fileId,
    latestVersion: dto.latestVersion || 0,
    qualityScore: dto.qualityScore || 0,
    missingRateFormatted: formatPercent(dto.missingRate),
    duplicateRateFormatted: formatPercent(dto.duplicateRate),
    totalRowsFormatted: (dto.totalRows || 0).toLocaleString(),
    totalColumns: dto.totalColumns || 0,
    analyzedAtFormatted: dto.analyzedAt ? new Date(dto.analyzedAt).toLocaleString('zh-CN') : '-',
  }
}

export const mapQualityStatusDtoToVM = (dto: QualityStatusDTO): QualityStatusVM => {
  // 核心：把业务 stage 映射为纯粹的 UI 状态颜色
  const { stage, message, ...rest } = dto
  let uiStatus: QualityUIStatus = 'default'

  // 🌟 核心魔法：如果当前全局阶段属于“质量检测”之后的任何阶段
  if (POST_QUALITY_STAGES.includes(stage)) {
    return {
      ...rest,
      uiStatus: 'success', // 强行让 UI 显示成功绿勾
      message: '质量检测已完成 (文件已进入后续阶段)',
      updatedAtFormatted: dto.updatedAt ? new Date(dto.updatedAt).toLocaleTimeString('zh-CN') : '',
      hasResult: dto.hasResult || false,
      stage: stage,
    }
  }

  if (['uploaded', 'quality_pending', 'quality_analyzing'].includes(stage)) {
    uiStatus = 'processing'
  } else if (stage === 'quality_done') {
    uiStatus = 'success'
  } else if (stage === 'quality_failed') {
    uiStatus = 'error'
  }

  return {
    updatedAtFormatted: dto.updatedAt ? new Date(dto.updatedAt).toLocaleTimeString('zh-CN') : '',
    hasResult: dto.hasResult || false,
    stage: stage,
    message: dto.message || '未知状态',
    uiStatus,
  }
}
