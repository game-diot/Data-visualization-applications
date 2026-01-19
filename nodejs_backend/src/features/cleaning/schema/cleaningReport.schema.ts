import { Schema } from "mongoose";
import { ICleaningReport } from "../models/interfaces/cleaningReport.interface";

export const CleaningReportSchema = new Schema<ICleaningReport>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "CleaningSession",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "CleaningTask",
      required: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },

    qualityVersion: { type: Number, required: true },
    cleaningVersion: { type: Number, required: true },

    // ❌ 删除旧字段
    // cleanedFilePath: { type: String, required: true },

    // ✅ 新增匹配字段 (FastAPI 返回的是对象)
    cleanedAsset: {
      path: { type: String, required: true }, // 对应 cleaned_asset_ref.path
      preview: { type: Schema.Types.Mixed }, // 对应 preview
    },

    // 基础统计
    summary: {
      rowsBefore: Number,
      rowsAfter: Number,
      columnsBefore: Number,
      columnsAfter: Number,
      rowsRemoved: Number,
      columnsRemoved: Number,
      cellsModified: Number,
      userActionsApplied: Number,
      rulesApplied: [String],
      missingRateBefore: Number,
      missingRateAfter: Number,
      duplicateRateBefore: Number,
      duplicateRateAfter: Number,
    },

    // 差异详情
    diffSummary: {
      byRule: { type: Schema.Types.Mixed },
      byColumn: { type: Schema.Types.Mixed },
    },

    // 统一日志字段名 (Service 层用的是 detailLog, 这里匹配一下)
    logs: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "cleaning_reports",
  }
);

CleaningReportSchema.index(
  { sessionId: 1, cleaningVersion: 1 },
  { unique: true }
);
