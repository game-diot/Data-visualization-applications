import mongoose from "mongoose";
import { IQualityReport } from "./interface/quality-result.interface";
import { QualityReportSchema } from "../schema/qualityResult.schema";

export const QualityReportModel = mongoose.model<IQualityReport>(
  "QualityReport",
  QualityReportSchema
);
