import { Schema } from "mongoose";
import { FILE_STAGE_ENUM } from "../constant/file-stage.constant";
import { QualityAnalysisResultSchema } from "../../quality/schema/qualityResult.schema";
import { IFile } from "../models/interface/ifile.interface";

/**
 * File Mongoose Schema 定义
 */
export const fileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    mimetype: { type: String, required: true },
    extension: { type: String, required: true },

    userId: { type: String, index: true },
    hash: { type: String, index: true },

    stage: {
      type: String,
      enum: FILE_STAGE_ENUM,
      default: "uploaded",
      required: true,
      index: true,
    },

    fastApiFileId: { type: String, index: true },
    analysisError: {
      type: {
        stage: String,
        code: Schema.Types.Mixed, // 允许 string 或 number
        message: String,
        occurredAt: Date,
        details: Schema.Types.Mixed,
      },
      required: false,
      _id: false, // 不需要子文档 ID
    },

    uploadedAt: { type: Date, default: Date.now },
    analysisStartedAt: { type: Date },
    analysisCompletedAt: { type: Date },

    // ⭐️ [核心变更] 摘要字段定义 ⭐️
    latestQualityVersion: { type: Number }, // 不加 required，因为上传初期没有
    qualityScore: { type: Number },
    missingRate: { type: Number },
    duplicateRate: { type: Number },
    totalRows: { type: Number },
    totalColumns: { type: Number },
  },
  {
    timestamps: true, // 自动管理 createdAt, updatedAt
    collection: "files",
  }
);

// --- 索引 ---
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ hash: 1 });
