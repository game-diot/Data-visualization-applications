import type { FileDTO, FileListResponseDTO, FileDetailDTO } from '../dto/file.dto'
import type { DatasetVM, DatasetListVM, DatasetDetailVM } from '../types/file.types'
import type { UnifiedTaskStatus } from '@/shared/types/status'

// 字节转换工具 (可抽离到 shared/utils，此处简写)
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const mapStageToUnifiedStatus = (stage: string): UnifiedTaskStatus => {
  const stageLower = stage.toLowerCase()
  if (['failed', 'error', 'isdeleted'].includes(stageLower)) return 'failed'
  if (['succeed', 'done', 'quality_done', 'analysis_done'].includes(stageLower)) return 'success'
  if (['running', 'processing', 'cleaning', 'analysising'].includes(stageLower)) return 'running'

  return 'pending'
}

export const mapFIleDTOToVM = (dto: FileDTO): DatasetVM => {
  return {
    id: dto._id,
    name: dto.name,
    sizeFormatted: formatBytes(dto.size),
    extension: dto.extension,
    stage: dto.stage,
    uiStatus: mapStageToUnifiedStatus(dto.stage),
    isDeleted: dto.isDeleted,
    errorMessage: dto.errorMessage,
    uploadedAtFormatted: new Date(dto.uploadAt || dto.createdAt).toLocaleString('zh-CN', {
      hour12: false,
    }),
  }
}

export const mapFileListDTOToVM = (dto: FileListResponseDTO): DatasetListVM => {
  return {
    data: dto.items.map(mapFIleDTOToVM),
    total: dto.total,
  }
}

export const mapFileDetailDtoToVM = (dto: FileDetailDTO): DatasetDetailVM => {
  const baseVM = mapFIleDTOToVM(dto)

  return {
    ...baseVM,
    // 数字千分位格式化，提升数字阅读体验
    totalRows: dto.totalRows ? dto.totalRows.toLocaleString() : '-',
    totalColumns: dto.totalColumns ? dto.totalColumns.toLocaleString() : '-',
    qualityScore: dto.qualityScore ?? 0,
    latestQualityVersion: dto.latestQualityVersion ?? null,
    // 派生出三大核心模块的进度状态，供 FlowCards 使用
    flowStatus: {
      quality: dto.qualityScore !== undefined ? 'done' : 'pending',
      cleaning: dto.hasCleanedData ? 'done' : 'pending',
      analysis: dto.hasAnalysisReports ? 'done' : 'pending',
    },
  }
}
