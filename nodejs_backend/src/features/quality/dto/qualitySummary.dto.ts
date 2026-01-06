/**
 * 质量分析摘要 DTO
 * 场景：供 Cleaning 模块或前端列表页快速获取关键指标
 */
export interface QualitySummaryResponseDTO {
  fileId: string;

  // 版本控制 (Cleaning 模块必须知道基于哪个版本清洗)
  latestVersion: number;

  // 核心指标
  qualityScore: number;
  missingRate: number;
  duplicateRate: number;

  // 规模指标
  totalRows: number;
  totalColumns: number;

  // 分析完成时间
  analyzedAt: Date;
}
