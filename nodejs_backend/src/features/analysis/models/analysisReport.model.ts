import { model } from "mongoose";
import { AnalysisReportSchema } from "../schema/analysisReport.schema";
import { IAnalysisReport } from "./interface/analysisReport.interface";

export const AnalysisReportModel = model<IAnalysisReport>(
  "AnalysisReport",
  AnalysisReportSchema,
);
