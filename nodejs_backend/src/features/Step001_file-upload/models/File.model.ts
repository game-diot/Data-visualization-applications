import mongoose, { Document, Schema, Model } from "mongoose";
// 假设这是你之前定义的 DTO，保持引用
import { FastApiAnalysisResultDTO } from "../../Step001.5_quality-analysis/dto/QualityResult.dto";

// ==========================================
// 1. 枚举与类型定义 (Types & Enums)
// ==========================================

/**
 * 文件处理全生命周期状态
 */
export type FileStage =
  | "uploaded" // [Node] 已接收并保存到本地磁盘/OSS
  | "transferring" // [Node -> Python] 正在发送给计算服务
  | "analyzing" // [Python] 计算服务正在处理中
  | "processed" // [Node] 接收到结果并入库
  | "failed"; // [System] 任意环节失败

/**
 * 嵌入式 Schema 类型定义 (保持你原有的结构，做微调)
 * 使用 _id: false 可以避免子文档生成不必要的 ObjectId，节省空间
 */
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

const AnomalyStatisticsSchema = new Schema(
  {
    total: { type: Number, required: true },
    by_type: { type: Map, of: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    details: { type: [AnomalyDetailSchema], required: true },
  },
  { _id: false }
);

const DuplicateStatisticsSchema = new Schema(
  {
    total_duplicate_rows: { type: Number, required: true },
    unique_duplicate_groups: { type: Number, required: true },
    duplicate_rate: { type: Number, required: true },
    rows: { type: [Number], required: true },
  },
  { _id: false }
);

const MissingStatisticsSchema = new Schema(
  {
    total_missing_cells: { type: Number, required: true },
    missing_rate: { type: Number, required: true },
    by_column: { type: Map, of: Number, required: true },
    columns_with_missing: { type: [String], required: true },
  },
  { _id: false }
);

// 核心分析结果子文档
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

// ==========================================
// 2. 接口定义 (Interfaces)
// ==========================================

/**
 * 纯数据接口 (用于 Service/DTO)
 */
export interface IFile {
  // --- 基础元数据 ---
  name: string; // 原始文件名 (display name) e.g., "sales_data.csv"
  storedName: string; // 存储文件名 (unique name) e.g., "17098888_sales.csv"
  path: string; // 物理路径
  size: number; // 字节大小
  mimetype: string; // MIME类型 e.g., "text/csv"
  extension: string; // 扩展名 e.g., ".csv"

  // --- 归属与安全 ---
  userId?: string; // (新增) 上传者ID，如果是单用户系统可暂留空，建议加上
  hash?: string; // (新增) 文件MD5指纹，用于去重校验

  // --- 状态流转 ---
  stage: FileStage; // 当前状态
  isDeleted: boolean; // (新增) 软删除标记

  // --- 外部系统关联 ---
  fastApiFileId?: string; // Python端返回的ID

  // --- 错误追踪 ---
  errorMessage?: string; // (新增) 如果 stage 为 failed，这里存具体的报错堆栈或信息

  // --- 性能监控 ---
  uploadedAt: Date; // Node接收完成时间
  analysisStartedAt?: Date; // Python开始分析时间
  analysisCompletedAt?: Date; // 分析完成时间

  // --- 核心业务数据 ---
  analysisResult?: FastApiAnalysisResultDTO;
}

/**
 * Mongoose Document 接口
 */
export interface IFileDocument extends IFile, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // 可以在这里添加 instance methods 类型定义
}

// ==========================================
// 3. Schema 定义 (Mongoose Schema)
// ==========================================

const fileSchema = new Schema<IFileDocument>(
  {
    // 1. 基础信息
    name: { type: String, required: true, trim: true, index: true }, // 加索引方便搜索
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    mimetype: { type: String, required: true },
    extension: { type: String, required: true },

    // 2. 归属
    userId: { type: String, index: true }, // 即使现在不用，加上索引备用
    hash: { type: String, index: true }, // 用于秒传检测

    // 3. 状态控制
    stage: {
      type: String,
      enum: ["uploaded", "transferring", "analyzing", "processed", "failed"],
      default: "uploaded",
      required: true,
      index: true, // 方便查询 "pending" 的任务
    },
    isDeleted: { type: Boolean, default: false, index: true }, // 默认未删除

    // 4. 外部关联
    fastApiFileId: { type: String, index: true },

    // 5. 错误信息
    errorMessage: { type: String },

    // 6. 时间节点 (Mongoose 自动管理 createdAt/updatedAt，这里补充业务时间)
    uploadedAt: { type: Date, default: Date.now },
    analysisStartedAt: { type: Date },
    analysisCompletedAt: { type: Date },

    // 7. 分析结果 (嵌入式)
    analysisResult: {
      type: AnalysisResultEmbeddedSchema,
      required: false,
    },
  },
  {
    timestamps: true, // 自动管理 createdAt, updatedAt
    collection: "files",
  }
);

// ==========================================
// 4. 索引优化 (Index Optimization)
// ==========================================
// 复合索引：查询某用户的未删除文件，按时间倒序 (常用场景：我的文件列表)
fileSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

export const FileModel: Model<IFileDocument> = mongoose.model<IFileDocument>(
  "File",
  fileSchema
);
