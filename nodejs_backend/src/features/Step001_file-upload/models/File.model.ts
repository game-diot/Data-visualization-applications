import mongoose, { Document, Schema, Model } from "mongoose";

// ==========================================
// 1. 模块化集成 (Modular Integration)
// ==========================================
// 引入 Quality 模块定义的 DTO (类型契约)
import { QualityAnalysisSnapshot } from "../../file/types/quality-snapshot.type";

// 引入 Quality 模块定义的 Schema (存储结构)
import { QualityAnalysisResultSchema } from "../../file/schemas/quality.schemas";
import { FastApiQualityResultDTO } from "features/Step001.5_quality-analysis/dto/fastapi-quality-result.dto";
import { FILE_STAGE_ENUM } from "features/file/enum/fileStage.enum";
/**
 * 文件全生命周期状态
 * 只描述“当前所处阶段”，不描述阶段内部细节
 */
export type FileStage =
  // ===== 文件层 =====
  | "uploaded" // 文件已上传
  | "uploaded_failed"
  | "isDeleted"

  // ===== 质量分析阶段 =====
  | "quality_pending" // 等待质量分析
  | "quality_analyzing" // 质量分析中
  | "quality_done" // 质量分析完成
  | "quality_failed" // 质量分析失败

  // ===== 数据清洗阶段 =====
  | "cleaning_pending"
  | "cleaning"
  | "cleaning_done"
  | "cleaning_failed"

  // ===== 数据分析阶段 =====
  | "analysis_pending"
  | "analysis"
  | "analysis_done"
  | "analysis_failed"

  // ===== AI 阶段 =====
  | "ai_pending"
  | "ai_generating"
  | "ai_done"
  | "ai_failed";

// ==========================================
// 2. 接口定义 (Interfaces)
// ==========================================

/**
 * 纯数据接口 (用于 Service/DTO)
 */
export interface IFile {
  // --- 基础元数据 ---
  name: string; // 原始文件名
  storedName: string; // 存储文件名 (Unique)
  path: string; // 物理路径
  size: number; // 字节大小
  mimetype: string; // MIME类型
  extension: string; // 扩展名

  // --- 归属与安全 ---
  userId?: string; // 上传者ID
  hash?: string; // 文件指纹 (MD5/SHA256)

  // --- 状态流转 ---
  // 使用从 quality.dto 导入的统一状态枚举，确保全系统一致
  stage: FileStage;

  isDeleted: boolean; // 软删除标记

  // --- 外部系统关联 ---
  fastApiFileId?: string; // Python端返回的任务ID

  // --- 错误追踪 ---
  errorMessage?: string; // 失败原因记录

  // --- 性能监控 ---
  uploadedAt: Date; // 上传时间
  analysisStartedAt?: Date; // 开始分析时间
  analysisCompletedAt?: Date; // 分析完成时间

  // --- 核心业务数据 (嵌入式) ---
  // ⭐️ 核心集成：直接使用 Quality 模块导出的 DTO
  // 这样当 Quality 模块修改字段时，这里会自动报错提示更新，而不是运行时崩溃
  analysisResult?: FastApiQualityResultDTO;
}

/**
 * Mongoose Document 接口
 */
export interface IFileDocument extends IFile, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 3. Schema 定义 (Mongoose Schema)
// ==========================================

const fileSchema = new Schema<IFileDocument>(
  {
    // 1. 基础信息
    name: { type: String, required: true, trim: true, index: true },
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    mimetype: { type: String, required: true },
    extension: { type: String, required: true },

    // 2. 归属
    userId: { type: String, index: true },
    hash: { type: String, index: true },

    // 3. 状态控制
    stage: {
      type: String,
      enum: FILE_STAGE_ENUM,
      default: "uploaded",
      required: true,
      index: true,
    },

    isDeleted: { type: Boolean, default: false, index: true },

    // 4. 外部关联
    fastApiFileId: { type: String, index: true },

    // 5. 错误信息
    errorMessage: { type: String },

    // 6. 时间节点
    uploadedAt: { type: Date, default: Date.now },
    analysisStartedAt: { type: Date },
    analysisCompletedAt: { type: Date },

    // 7. 分析结果 (嵌入式集成)
    // ⭐️ 核心集成：直接引用 QualityAnalysisResultSchema
    // 这样 FileModel 不需要知道 "missing_rate" 这种细节，实现了模块解耦
    analysisResult: {
      type: QualityAnalysisResultSchema,
      required: false, // 刚上传时没有结果
    },
  },
  {
    timestamps: true, // 自动管理 createdAt, updatedAt
    collection: "files",
  }
);

// ==========================================
// 4. 索引优化
// ==========================================
// 复合索引：查询某用户的未删除文件，按时间倒序
fileSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

export const FileModel: Model<IFileDocument> = mongoose.model<IFileDocument>(
  "File",
  fileSchema
);
