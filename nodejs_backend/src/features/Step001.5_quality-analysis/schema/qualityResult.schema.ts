import { Schema } from "mongoose";
import {
  IMissingStatistics,
  IDuplicateStatistics,
  IAnomalyStatistics,
  IAnomalyDetail,
  IQualityReport,
} from "../models/interface/quality-result.interface";

// --- 子 Schema 定义 ---

const AnomalyDetailSchema = new Schema<IAnomalyDetail>(
  {
    row: { type: Number, required: true },
    column: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false } // 纯数据结构，不需要 _id
);

const AnomalyStatisticsSchema = new Schema<IAnomalyStatistics>(
  {
    total: { type: Number, required: true },
    by_type: { type: Map, of: Number, required: true }, // Record -> Map
    by_column: { type: Map, of: Number, required: true }, // Record -> Map
    details: { type: [AnomalyDetailSchema], required: true },
  },
  { _id: false }
);

const DuplicateStatisticsSchema = new Schema<IDuplicateStatistics>(
  {
    total_duplicate_rows: { type: Number, required: true },
    unique_duplicate_groups: { type: Number, required: true },
    duplicate_rate: { type: Number, required: true },
    rows: { type: [Number], required: true },
  },
  { _id: false }
);

const MissingStatisticsSchema = new Schema<IMissingStatistics>(
  {
    total_missing_cells: { type: Number, required: true },
    missing_rate: { type: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    columns_with_missing: { type: [String], required: true },
  },
  { _id: false }
);

/**
 * Export: 质量分析结果核心 Schema
 * 注意：这个 Schema 会被 QualityReport 使用，也会被 FileModel 引用
 */
export const QualityAnalysisResultSchema = new Schema(
  {
    file_id: { type: String, required: true },
    row_count: { type: Number, required: true },
    column_count: { type: Number, required: true },
    quality_score: { type: Number, required: true },

    missing: { type: MissingStatisticsSchema, required: true },
    duplicates: { type: DuplicateStatisticsSchema, required: true },
    anomalies: { type: AnomalyStatisticsSchema, required: true },

    types: { type: Map, of: String, required: true },
  },
  { _id: false, timestamps: false }
);

export const QualityReportSchema = new Schema<IQualityReport>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    version: { type: Number, required: true },

    // 嵌入之前定义的 Result Schema
    snapshot: { type: QualityAnalysisResultSchema, required: true },
  },
  {
    timestamps: true,
    collection: "quality_reports",
  }
);

// 复合索引：查询某文件的最新版本报告 (按版本倒序)
QualityReportSchema.index({ fileId: 1, version: -1 });
