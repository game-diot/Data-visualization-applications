import mongoose from "mongoose";
import { CleaningReportSchema } from "../schema/cleaningReport.schema";
import { ICleaningReport } from "./interfaces/cleaningReport.interface";

export const CleaningReportModel = mongoose.model<ICleaningReport>(
  "CleaningReport",
  CleaningReportSchema
);
