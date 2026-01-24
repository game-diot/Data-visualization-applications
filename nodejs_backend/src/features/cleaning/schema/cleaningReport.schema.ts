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
      type: { type: String }, // ✅ 新增
      path: { type: String, required: true },
      format: { type: String }, // ✅ 新增
      sizeBytes: { type: Number }, // ✅ 新增（camelCase）
      preview: { type: Schema.Types.Mixed },
    },

    // ✅ 新增：结构化规则明细
    rulesAppliedDetail: { type: [Schema.Types.Mixed], default: [] },

    // ✅ 新增：回放统计
    actionsReplay: {
      total: { type: Number, default: 0 },
      applied: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },

    // ✅ 日志建议改成 string[]
    logs: { type: [String], default: [] },

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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "cleaning_reports",
  },
);

CleaningReportSchema.index(
  { fileId: 1, qualityVersion: 1, cleaningVersion: 1 },
  { unique: true },
);
