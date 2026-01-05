import { Schema } from "mongoose";
import { FILE_STAGE_ENUM } from "../constant/file-stage.constant";
import { QualityAnalysisResultSchema } from "../../Step001.5_quality-analysis/schema/qualityResult.schema";
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
    errorMessage: { type: String },

    uploadedAt: { type: Date, default: Date.now },
    analysisStartedAt: { type: Date },
    analysisCompletedAt: { type: Date },

    // 这里直接引用之前做好的子 Schema
    analysisResult: { type: QualityAnalysisResultSchema, required: false },
  },
  {
    timestamps: true, // 自动管理 createdAt, updatedAt
    collection: "files",
  }
);

// --- 索引 ---
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ hash: 1 });
