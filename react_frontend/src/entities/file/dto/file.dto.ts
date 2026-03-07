// 1. 解析出的具体错误信息对象 DTO
export interface FileAnalysisErrorDTO {
  stage: string
  code: string
  message: string
  details: string
  occurredAt: string
}

// 2. 单个文件数据的完整 DTO (严格对齐 items 数组里的每一个字段)
export interface FileDTO {
  _id: string
  name: string
  storedName: string
  path: string
  size: number
  mimetype: string
  extension: string
  hash: string
  stage: string

  // 时间戳相关 (部分可能是后端动态生成的，用可选符 ? 兜底更安全)
  uploadedAt: string
  createdAt: string
  updatedAt: string
  analysisStartedAt?: string
  analysisCompletedAt?: string

  // 质量检测与清洗分析指标
  qualityScore?: number
  latestQualityVersion?: number
  isCleaned?: boolean
  duplicateRate?: number
  missingRate?: number
  totalRows?: number
  totalColumns?: number

  // 错误信息 (如果没有报错，后端可能不传或传 null)
  analysisError?: FileAnalysisErrorDTO | null
}

// 3. 列表请求的响应 DTO (对应拦截器返回的 body.data)
export interface FilesListResponseDTO {
  items: FileDTO[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
