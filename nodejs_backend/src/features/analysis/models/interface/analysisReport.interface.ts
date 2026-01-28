import type { Document, Types } from "mongoose";

export interface IAnalysisReport extends Document {
  taskId: Types.ObjectId;

  fileId: Types.ObjectId;
  qualityVersion: number;
  cleaningVersion: number;
  analysisVersion: number;

  summary: any;
  charts: any[];
  modelResult?: any | null;
  artifacts?: any[];

  logs: string[];

  createdAt: Date;
}
