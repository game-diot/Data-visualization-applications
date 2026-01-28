import { Schema } from "mongoose";
import { ANALYSIS_TYPE } from "../constant/analysisiType.constant";

export const AnalysisConfigSchema = new Schema(
  {
    type: { type: String, required: true, enum: [...ANALYSIS_TYPE] },
    columns: { type: [String], required: true },

    target: { type: String, default: null },
    groupBy: { type: String, default: null },

    options: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);
