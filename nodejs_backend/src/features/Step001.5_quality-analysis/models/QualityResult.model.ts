/**
 * --- 统一的状态枚举 (用于 IFile 接口和 Schema) ---
 */
export type FileStage =
  | "uploaded" // 已上传到本地 Node.js 服务器
  | "transferring" // 正在上传到 FastAPI 服务
  | "analyzing" // FastAPI 正在执行质量分析
  | "processed" // 分析完成，结果已保存
  | "failed"; // 处理过程中失败
// -------------------------------------------------------------
//     FastApiAnalysisResultDTO 的子结构定义
// -------------------------------------------------------------

/** 异常详情：表示数据集中单个异常单元格的信息 */
export interface AnomalyDetail {
  row: number; // 行号（从 1 开始，用于前端展示）
  column: string; // 列名
  value: any; // 异常值（使用 any 以适应各种数据类型）
  type: "missing" | "outlier_iqr" | "outlier_zscore" | "duplicate_row" | string; // 异常类型
  reason: string; // 异常原因描述
}

/** 异常值统计 */
export interface AnomalyStatistics {
  total: number;
  by_type: Record<string, number>;
  by_column: Record<string, number>;
  details: AnomalyDetail[];
}

/** 重复行统计 */
export interface DuplicateStatistics {
  total_duplicate_rows: number;
  unique_duplicate_groups: number;
  duplicate_rate: number;
  rows: number[];
}

/** 缺失值统计 */
export interface MissingStatistics {
  total_missing_cells: number;
  missing_rate: number;
  by_column: Record<string, number>;
  columns_with_missing: string[];
}

/** * --- 核心 DTO：FastAPI 返回的完整分析结果结构 ---
 */
export interface FastApiQualityAnalysisResultDTO {
  file_id: string; // FastAPI 侧对应的文件 ID // 基础统计
  row_count: number;
  column_count: number; // 质量评分

  quality_score: number; // 0 到 100 之间的评分 // 统计子文档

  missing: MissingStatistics;
  duplicates: DuplicateStatistics;
  anomalies: AnomalyStatistics; // 列类型

  types: Record<string, string>;
}
