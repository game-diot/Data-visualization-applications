/** 异常详情：表示数据集中单个异常单元格的信息 */
export interface AnomalyDetailDTO {
  row: number; // 行号（从 1 开始）
  column: string; // 列名
  value: any; // 异常值 (可能是 null, string, number)
  type: "missing" | "outlier_iqr" | "outlier_zscore" | "duplicate" | string;
  reason: string; // 异常描述
}

/** 异常值统计 */
export interface AnomalyStatisticsDTO {
  total: number;
  by_type: Record<string, number>; // e.g. { "missing": 10, "outlier": 5 }
  by_column: Record<string, number>; // e.g. { "age": 3, "salary": 2 }
  details: AnomalyDetailDTO[]; // 详情列表
}

/** 重复行统计 */
export interface DuplicateStatisticsDTO {
  total_duplicate_rows: number;
  unique_duplicate_groups: number;
  duplicate_rate: number;
  rows: number[]; // 重复的行号列表
}

/** 缺失值统计 */
export interface MissingStatisticsDTO {
  total_missing_cells: number;
  missing_rate: number;
  by_column: Record<string, number>;
  columns_with_missing: string[];
}
