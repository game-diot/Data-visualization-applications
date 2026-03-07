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
  isDeleted: boolean
  uploadAt: string
  createdAt: string
  updatedAt: string
  __v: number
  errorMessage?: string
}

export interface FileListResponseDTO {
  items: FileDTO[]
  total: number
  page: number
  pageSize: number
}

// 详情页后端返回的原始结构 (继承基础属性，增加统计指标)
export interface FileDetailDTO extends FileDTO {
  totalRows?: number
  totalColumns?: number
  qualityScore?: number
  latestQualityVersion?: number
  hasCleanedData?: boolean
  hasAnalysisReports?: boolean
  // 其他扩展字段...
}
