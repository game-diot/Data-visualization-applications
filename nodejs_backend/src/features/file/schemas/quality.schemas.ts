import { model, Schema } from "mongoose";

/**
 * 异常详情 Schema
 * 对应 AnomalyDetailDTO
 */
const AnomalyDetailSchema = new Schema(
  {
    row: { type: Number, required: true },
    column: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }, // 对应 any，允许存储 null/str/num
    type: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
); // 禁用 _id

/**
 * 异常统计 Schema
 * 对应 AnomalyStatisticsDTO
 */
const AnomalyStatisticsSchema = new Schema(
  {
    total: { type: Number, required: true },
    // Record<string, number> -> Map of Number
    by_type: { type: Map, of: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    details: { type: [AnomalyDetailSchema], required: true },
  },
  { _id: false }
);

/**
 * 重复行统计 Schema
 * 对应 DuplicateStatisticsDTO
 */
const DuplicateStatisticsSchema = new Schema(
  {
    total_duplicate_rows: { type: Number, required: true },
    unique_duplicate_groups: { type: Number, required: true },
    duplicate_rate: { type: Number, required: true },
    rows: { type: [Number], required: true },
  },
  { _id: false }
);

/**
 * 缺失值统计 Schema
 * 对应 MissingStatisticsDTO
 */
const MissingStatisticsSchema = new Schema(
  {
    total_missing_cells: { type: Number, required: true },
    missing_rate: { type: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    columns_with_missing: { type: [String], required: true },
  },
  { _id: false }
);

/**
 * 核心：质量分析结果 Schema
 * 对应 QualityAnalysisResultDTO
 * 将被嵌入到 FileModel 中
 */
export const QualityAnalysisResultSchema = new Schema(
  {
    file_id: { type: String, required: true },

    row_count: { type: Number, required: true },
    column_count: { type: Number, required: true },

    quality_score: { type: Number, required: true },

    // 嵌入子文档
    missing: { type: MissingStatisticsSchema, required: true },
    duplicates: { type: DuplicateStatisticsSchema, required: true },
    anomalies: { type: AnomalyStatisticsSchema, required: true },

    // 列类型映射 (Record<string, string>)
    types: { type: Map, of: String, required: true },
  },
  { _id: false, timestamps: false }
);
