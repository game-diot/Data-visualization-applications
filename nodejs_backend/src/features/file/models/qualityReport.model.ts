import { Schema, model, Document } from "mongoose";
import { QualityAnalysisResultSchema } from "../../Step001.5_quality-analysis/schema/qualityResult.schema"; // 你已经写的

export interface IQualityReportDocument extends Document {
  fileId: string; // 对应 FileModel 的 _id
  version: number; // 分析版本号，每次分析 +1
  snapshot: any; // 嵌入 QualityAnalysisResultSchema
  createdAt: Date;
  updatedAt: Date;
}

const QualityReportSchema = new Schema<IQualityReportDocument>(
  {
    fileId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    snapshot: { type: QualityAnalysisResultSchema, required: true },
  },
  {
    timestamps: true, // 自动生成 createdAt / updatedAt
    collection: "quality_reports",
  }
);

// 复合索引：方便查询最新版本
QualityReportSchema.index({ fileId: 1, version: -1 });

export const QualityReportModel = model<IQualityReportDocument>(
  "QualityReport",
  QualityReportSchema
);
