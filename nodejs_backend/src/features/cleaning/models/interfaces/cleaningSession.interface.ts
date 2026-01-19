import { CleaningSessionStatus } from "features/cleaning/constant/cleaningSessionStatus.constant";
import mongoose from "mongoose";

// --- 定义规则子接口 (CamelCase) ---

export interface IMissingRule {
  enabled: boolean;
  strategy?: "drop_rows" | "fill";
  fillMethod?: "mean" | "median" | "mode" | "constant" | "ffill" | "bfill";
  constantValue?: any;
  applyColumns?: string[];
}

export interface IDeduplicateRule {
  enabled: boolean;
  subset?: string[];
  keep?: "first" | "last" | false;
}

export interface ITypeCastItem {
  column: string;
  targetType: "int" | "float" | "str" | "bool" | "datetime" | "category";
  format?: string;
}

export interface ITypeCastRule {
  enabled: boolean;
  rules?: ITypeCastItem[];
}

export interface IOutlierRule {
  enabled: boolean;
  method?: "iqr" | "zscore";
  threshold?: number;
  applyColumns?: string[];
}

export interface IFilterRule {
  enabled: boolean;
  dropColumns?: string[];
  dropRowsWhere?: string[];
}

// 聚合规则接口
export interface ICleanRules {
  missing?: IMissingRule;
  deduplicate?: IDeduplicateRule;
  typeCast?: ITypeCastRule;
  outliers?: IOutlierRule;
  filter?: IFilterRule;
}

export interface ICleaningSession {
  _id: mongoose.Types.ObjectId;
  fileId: mongoose.Types.ObjectId;
  qualityVersion: number; // 🔒 核心绑定

  latestCleaningVersion: number; // 系统维护自增
  status: CleaningSessionStatus;
  cleanRules: ICleanRules;

  lockedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ICleaningSessionDocument = Document & ICleaningSession;
