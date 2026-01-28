import { model } from "mongoose";
import { AnalysisTaskSchema } from "../schema/analysisTask.schema";
import type { IAnalysisTask } from "./interface/analysisTask.interface";

export const AnalysisTaskModel = model<IAnalysisTask>(
  "AnalysisTask",
  AnalysisTaskSchema,
);
