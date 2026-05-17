import mongoose, { Document, Types } from "mongoose";

export interface ICleaningSummary {
  rowsBefore: number;
  rowsAfter: number;
  columnsBefore: number;
  columnsAfter: number;
  rowsRemoved: number;
  columnsRemoved: number;
  cellsModified: number;
  userActionsApplied: number;
  rulesApplied: string[];
  missingRateBefore?: number | null;
  missingRateAfter?: number | null;
  duplicateRateBefore?: number | null;
  duplicateRateAfter?: number | null;
  durationMs?: number | null;
}

export interface ICleaningDiffSummary {
  // 对应 FastAPI 返回的结构
  byRule?: {
    beforeProfile?: any;
    afterProfile?: any;
    metrics?: Record<string, any>;
    profileDelta?: {
      rowsDropped?: number;
      colsDropped?: number;
    };
  };
  byColumn?: any;
}

// --- Report 主文档接口 ---
export interface ICleaningReport extends Document {
  sessionId: Types.ObjectId;
  taskId: Types.ObjectId;
  fileId: Types.ObjectId;
  qualityVersion: number;
  cleaningVersion: number;
  summary: ICleaningSummary | null;
  diffSummary: ICleaningDiffSummary;
  rulesAppliedDetail?: any[];
  actionsReplay?: { total: number; applied: number; failed: number } | null;
  cleanedAsset: {
    type?: "local_file" | "s3" | "oss";
    path: string;
    format?: "csv" | "parquet" | "json";
    sizeBytes?: number; // 用 camelCase 存 Mongo
    preview?: any[];
  };

  // 📝 执行日志
  logs: string[];

  createdAt: Date;
}
