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
  missingRateBefore: number;
  missingRateAfter: number;
  duplicateRateBefore: number;
  duplicateRateAfter: number;
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

  // 📊 核心统计 (替换原来的 metrics，因为 summary 包含了 metrics)
  summary: ICleaningSummary;

  // 🔍 差异详情
  diffSummary: ICleaningDiffSummary;

  // 📦 产物引用 (FastAPI 返回的 cleaned_asset_ref)
  cleanedAsset: {
    path: string; // 物理文件路径
    preview?: any[]; // 前 5 行预览
  };

  // 📝 执行日志
  logs: string[];

  createdAt: Date;
}
