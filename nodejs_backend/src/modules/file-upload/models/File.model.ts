import mongoose, { Document, Schema, Model } from "mongoose";
// 导入 DTO 中的分析结果类型，用于 TypeScript 接口
import { FastApiAnalysisResultDTO } from "../../quality/dto/QualityResult.dto";

// --- 统一的状态枚举 (用于 IFile 接口和 Schema) ---
export type FileStage =
  | "uploaded" // 已上传到本地 Node.js 服务器
  | "transferring" // 正在上传到 FastAPI 服务
  | "analyzing" // FastAPI 正在执行质量分析
  | "processed" // 分析完成，结果已保存
  | "failed"; // 处理过程中失败
// -------------------------------------------------------------
//     嵌入式分析结果子文档 Schemas
// -------------------------------------------------------------

// 1. AnomalyDetail Schema
const AnomalyDetailSchema = new Schema(
  {
    row: { type: Number, required: true },
    column: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

// 2. AnomalyStatistics Schema
const AnomalyStatisticsSchema = new Schema(
  {
    total: { type: Number, required: true },
    by_type: { type: Map, of: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    details: { type: [AnomalyDetailSchema], required: true },
  },
  { _id: false }
);

// 3. DuplicateStatistics Schema
const DuplicateStatisticsSchema = new Schema(
  {
    total_duplicate_rows: { type: Number, required: true },
    unique_duplicate_groups: { type: Number, required: true },
    duplicate_rate: { type: Number, required: true },
    rows: { type: [Number], required: true },
  },
  { _id: false }
);

// 4. MissingStatistics Schema
const MissingStatisticsSchema = new Schema(
  {
    total_missing_cells: { type: Number, required: true },
    missing_rate: { type: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    columns_with_missing: { type: [String], required: true },
  },
  { _id: false }
);

// 5. AnalysisResult 主嵌入文档 Schema
const AnalysisResultEmbeddedSchema = new Schema(
  {
    row_count: { type: Number, required: true },
    column_count: { type: Number, required: true },
    quality_score: { type: Number, required: true },
    missing: { type: MissingStatisticsSchema, required: true },
    duplicates: { type: DuplicateStatisticsSchema, required: true },
    anomalies: { type: AnomalyStatisticsSchema, required: true },
    types: { type: Map, of: String, required: true },
  },
  { _id: false }
);

// -------------------------------------------------------------
//     主文件接口和 Schema
// -------------------------------------------------------------

// 1. 定义纯数据接口 (用于 DTO 和 Service)
export interface IFile {
  name: string;
  storedName: string; // Multer 保存的文件名
  path: string; // 本地文件路径
  size: number;
  type?: string; // MIME 类型
  // 异步状态管理
  stage: FileStage; // 当前处理阶段
  fastApiFileId?: string; // FastAPI 服务中对应的文件ID
  analysisStartedAt?: Date; // 分析开始时间 (用于性能度量)
  analysisCompletedAt?: Date; // 分析结束时间 (用于性能度量)

  // 嵌入式分析结果 (可选字段)
  analysisResult?: FastApiAnalysisResultDTO;
}

// 2. 定义 Document 接口 (数据 + Mongoose 方法 + _id)
export interface IFileDocument extends IFile, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Mongoose Schema
const fileSchema = new Schema<IFileDocument>(
  {
    name: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    type: { type: String }, // 状态与外部ID

    stage: {
      type: String,
      enum: ["uploaded", "transferring", "analyzing", "processed", "failed"],
      default: "uploaded",
      required: true,
    },
    fastApiFileId: { type: String, required: false, index: true }, // 方便按外部 ID 查找

    // 性能时间戳
    analysisStartedAt: { type: Date, required: false },
    analysisCompletedAt: { type: Date, required: false },

    // 嵌入式分析结果
    analysisResult: {
      type: AnalysisResultEmbeddedSchema,
      required: false,
    },
  },
  { timestamps: true, collection: "files" }
);

// 4. 导出 Model
export const FileModel: Model<IFileDocument> = mongoose.model<IFileDocument>(
  "File",
  fileSchema
);
