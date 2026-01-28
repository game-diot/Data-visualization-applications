import { Schema } from "mongoose";

export const AnalysisReportSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "AnalysisTask",
      required: true,
      unique: true,
    },

    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    qualityVersion: { type: Number, required: true, index: true },
    cleaningVersion: { type: Number, required: true, index: true, default: 0 },
    analysisVersion: { type: Number, required: true, index: true },

    summary: { type: Schema.Types.Mixed, default: {} },
    charts: { type: [Schema.Types.Mixed], default: [] },
    modelResult: { type: Schema.Types.Mixed, default: null },
    artifacts: { type: [Schema.Types.Mixed], default: [] },

    logs: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "analysis_reports",
  },
);

// unique version per input-version group
AnalysisReportSchema.index(
  { fileId: 1, qualityVersion: 1, cleaningVersion: 1, analysisVersion: 1 },
  { unique: true },
);
