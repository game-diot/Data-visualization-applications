/**
 * 异常详情：表示数据集中单个异常单元格的信息
 */
export interface AnomalyDetail {
  row: number; // 行号（从 1 开始，用于前端展示）
  column: string; // 列名
  value: any; // 异常值（使用 any 以适应各种数据类型）
  type: "missing" | "outlier_iqr" | "outlier_zscore" | "duplicate_row" | string; // 异常类型
  reason: string; // 异常原因描述
}

/**
 * 异常值统计
 */
export interface AnomalyStatistics {
  total: number; // 异常值总数 (不包含缺失值和重复行，仅指数据点异常)
  by_type: Record<string, number>; // 按异常类型统计 { outlier_iqr: 5, ... }
  by_column: Record<string, number>; // 按列统计异常数量
  details: AnomalyDetail[]; // 异常值详情列表
}

/**
 * 重复行统计
 */
export interface DuplicateStatistics {
  total_duplicate_rows: number; // 重复行总数（即被认为是重复的那部分行）
  unique_duplicate_groups: number; // 重复组数
  duplicate_rate: number; // 重复率 (基于总行数)
  rows: number[]; // 重复行号列表（从 1 开始）
}

/**
 * 缺失值统计
 */
export interface MissingStatistics {
  total_missing_cells: number; // 缺失单元格总数
  missing_rate: number; // 整体缺失率 (基于总单元格数)
  by_column: Record<string, number>; // 各列缺失单元格数
  columns_with_missing: string[]; // 有缺失值的列名列表
}

/**
 * 核心 DTO：FastAPI 返回的完整分析结果结构
 * 此结构将嵌套存储在 Node.js 文件模型的 analysisResult 字段中。
 */
export interface FastApiAnalysisResultDTO {
  // 理论上此 ID 在存储到 MongoDB 时应被忽略，因为它是外部 ID
  file_id: string; // 基础统计

  row_count: number;
  column_count: number; // 质量评分

  quality_score: number; // 0 到 100 之间的评分 // 缺失值统计

  missing: MissingStatistics; // 重复行统计

  duplicates: DuplicateStatistics; // 异常值统计

  anomalies: AnomalyStatistics; // 列类型分布（例如：{ 'name': 'string', 'age': 'int', 'salary': 'float' }）

  types: Record<string, string>;
}
