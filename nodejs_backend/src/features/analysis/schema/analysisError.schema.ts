import { Schema } from "mongoose";
import { ANALYSIS_TASK_STAGE } from "../constant/analysisTaskStage.constant";

export const AnalysisErrorSchema = new Schema(
  {
    stage: { type: String, enum: [...ANALYSIS_TASK_STAGE], default: "unknown" },
    code: { type: String, required: true },
    message: { type: String, required: true },
    detail: { type: Schema.Types.Mixed, default: null },
    retryable: { type: Boolean, default: false },
    occurredAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
