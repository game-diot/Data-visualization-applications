export const FILE_STAGE_ENUM = [
  // ===== 文件层 =====
  "uploaded",
  "uploaded_failed",
  "isDeleted",
  // ===== 质量分析 =====
  "quality_pending",
  "quality_analyzing",
  "quality_done",
  "quality_failed",

  // ===== 数据清洗 =====
  "cleaning_pending",
  "cleaning_processing",
  "cleaning_done",
  "cleaning_failed",

  // ===== 数据分析 =====
  "analysis_pending",
  "analysis_processing",
  "analysis_done",
  "analysis_failed",

  // ===== AI 阶段 =====
  "ai_pending",
  "ai_generating",
  "ai_done",
  "ai_failed",
] as const;

export type FileStage = (typeof FILE_STAGE_ENUM)[number];
