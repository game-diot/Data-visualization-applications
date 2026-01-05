import mongoose, { HydratedDocument } from "mongoose";

/**
 * 1. 缺失值统计
 */
export interface IMissingStatistics {
  total_missing_cells: number;
  missing_rate: number;
  by_column: Record<string, number>;
  columns_with_missing: string[];
}

/**
 * 2. 重复值统计
 */
export interface IDuplicateStatistics {
  total_duplicate_rows: number;
  unique_duplicate_groups: number;
  duplicate_rate: number;
  rows: number[];
}

/**
 * 3. 异常详情
 */
export interface IAnomalyDetail {
  row: number;
  column: string;
  value: any; // 允许 null, string, number
  type: string;
  reason: string;
}

/**
 * 4. 异常值统计
 */
export interface IAnomalyStatistics {
  total: number;
  by_type: Record<string, number>;
  by_column: Record<string, number>;
  details: IAnomalyDetail[];
}

/**
 * 5. 核心：质量分析结果快照
 * 对应 Python 端返回的完整结构
 */
export interface IQualityAnalysisResult {
  file_id: string; // Python 任务 ID
  row_count: number;
  column_count: number;
  quality_score: number;

  // 子结构
  missing: IMissingStatistics;
  duplicates: IDuplicateStatistics;
  anomalies: IAnomalyStatistics;

  // 元数据
  types: Record<string, string>;
}

// ==========================================
// 1. 纯数据接口 (IQualityReport)
// ==========================================
export interface IQualityReport {
  // 关联 File 模块的主键
  fileId: mongoose.Types.ObjectId;

  // 版本号 (V1, V2...) 支持同一文件多次分析
  version: number;

  // 核心分析结果 (快照)
  // ⭐️ 这里直接复用接口，TS 类型检查会确保 snapshot 结构正确
  snapshot: IQualityAnalysisResult;

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// 2. Mongoose 文档类型
// ==========================================
export type IQualityReportDocument = HydratedDocument<IQualityReport>;
