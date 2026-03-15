import type { Document, Types } from "mongoose";

// 🚀 1. 为 Chart 补充强类型接口，注入 AI 基因
export interface IAnalysisChart {
  id: string;
  type: "histogram" | "bar" | "heatmap" | "table" | string;
  title: string;
  data: any;
  meta?: any;

  // 🌟 AI 辅助模块新增字段
  aiInsight?: string | null;
  aiStatus?: "idle" | "generating" | "success" | "failed";
}

// 🚀 2. 升级主报告接口
export interface IAnalysisReport extends Document {
  taskId: Types.ObjectId;

  fileId: Types.ObjectId;
  qualityVersion: number;
  cleaningVersion: number;
  analysisVersion: number;

  summary: any;

  // 🌟 替换掉原来的 charts: any[]
  charts: IAnalysisChart[];

  modelResult?: any | null;
  artifacts?: any[];

  logs: string[];

  createdAt: Date;
}
