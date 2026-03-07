import type { FileDTO, FilesListResponseDTO } from '../dto/file.dto'
import type { DatasetVM, DatasetListVM, DatasetDetailVM } from '../types/file.types'
import type { UnifiedTaskStatus } from '@/shared/types/status'

// 字节转换工具
const formatBytes = (bytes?: number) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 统一状态机转换 (修复了子串匹配问题)
export const mapStageToUnifiedStatus = (stage?: string): UnifiedTaskStatus => {
  if (!stage) return 'pending'
  const stageLower = stage.toLowerCase()

  // 使用正则或子串包含来匹配，因为后端可能会返回 'analysis_failed', 'quality_done'
  if (stageLower.includes('fail') || stageLower.includes('error') || stageLower.includes('deleted'))
    return 'failed'
  if (stageLower.includes('succeed') || stageLower.includes('done')) return 'success'
  if (
    stageLower.includes('running') ||
    stageLower.includes('processing') ||
    stageLower.includes('cleaning') ||
    stageLower.includes('analysising')
  )
    return 'running'

  return 'pending'
}

// 核心：单条文件数据清洗
export const mapFileDtoToVM = (dto: FileDTO): DatasetVM => {
  return {
    id: dto._id,
    name: dto.name || '未命名数据集',
    sizeFormatted: formatBytes(dto.size),
    extension: dto.extension,
    stage: dto.stage,
    uiStatus: mapStageToUnifiedStatus(dto.stage),

    // 优先展示给人看的 message，如果没有则降级展示 code
    errorMessage: dto.analysisError
      ? dto.analysisError.message || dto.analysisError.code
      : undefined,

    // 安全的时间化转换
    uploadedAtFormatted:
      dto.uploadedAt || dto.createdAt
        ? new Date(dto.uploadedAt || dto.createdAt).toLocaleString('zh-CN', { hour12: false })
        : '-',
  }
}

// 核心：列表数据包裹清洗 (增加防崩溃保护)
export const mapFileListDtoToVM = (dto: FilesListResponseDTO): DatasetListVM => {
  return {
    data: (dto?.items || []).map(mapFileDtoToVM),
    total: dto?.total || 0,
  }
}

// 核心：详情页数据派生 (修正了依赖的字段名)
export const mapFileDetailDtoToVM = (dto: FileDTO): DatasetDetailVM => {
  // 复用基础列表的清洗逻辑
  const baseVM = mapFileDtoToVM(dto)

  return {
    ...baseVM,
    totalRows: dto.totalRows ? dto.totalRows.toLocaleString() : '-',
    totalColumns: dto.totalColumns ? dto.totalColumns.toLocaleString() : '-',
    qualityScore: dto.qualityScore ?? 0,
    latestQualityVersion: dto.latestQualityVersion ?? null,

    // 派生出三大核心模块的进度状态
    flowStatus: {
      // 如果有质量分说明做过质量检测
      quality: dto.qualityScore !== undefined ? 'done' : 'pending',
      // 对应后端真实的 isCleaned 字段
      cleaning: dto.isCleaned ? 'done' : 'pending',
      // 如果有分析完成时间或者 stage 包含 analysis_done，则认为有分析报告
      analysis: dto.analysisCompletedAt || dto.stage === 'analysis_done' ? 'done' : 'pending',
    },
  }
}
