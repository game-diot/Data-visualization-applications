import { Schema } from "mongoose";
import { ANALYSIS_TASK_STATUS } from "../constant/analysisTaskStatus.constant";
import { ANALYSIS_TASK_STAGE } from "../constant/analysisTaskStage.constant";
import { DataRefSchema } from "./dataRef.schema";
import { DataSelectionSchema } from "./dataSelection.schema";
import { AnalysisConfigSchema } from "./analysisConfig.schema";
import { AnalysisErrorSchema } from "./analysisError.schema";

export const AnalysisTaskSchema = new Schema(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },

    qualityVersion: { type: Number, required: true, index: true },
    cleaningVersion: { type: Number, required: true, index: true, default: 0 },

    // version of analysis output (success-only increments handled in repo/service)
    analysisVersion: { type: Number, required: true },

    // input for reproducibility
    dataRef: { type: DataRefSchema, required: true },
    dataSelection: { type: DataSelectionSchema, default: null },
    analysisConfig: { type: AnalysisConfigSchema, required: true },

    // process tracking
    status: {
      type: String,
      enum: [...ANALYSIS_TASK_STATUS],
      default: "pending",
      index: true,
    },
    stage: {
      type: String,
      enum: [...ANALYSIS_TASK_STAGE],
      default: "received",
    },

    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },

    error: { type: AnalysisErrorSchema, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: "analysis_tasks",
  },
);

// common query index
AnalysisTaskSchema.index({
  fileId: 1,
  qualityVersion: 1,
  cleaningVersion: 1,
  createdAt: -1,
});
AnalysisTaskSchema.index({
  fileId: 1,
  qualityVersion: 1,
  cleaningVersion: 1,
  status: 1,
  createdAt: -1,
});
