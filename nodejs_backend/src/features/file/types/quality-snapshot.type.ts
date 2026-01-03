/**
 * Quality Analysis Snapshot
 * - 持久化到 MongoDB
 * - 代表某一时刻的质量分析资产
 */
export interface QualityAnalysisResultSummary {
  row_count: number;
  column_count: number;
  quality_score: number;
  total_missing_cells: number;
  missing_rate: number;
  total_duplicate_rows: number;
  duplicate_rate: number;
  anomalies_total: number;
}
export interface QualityAnalysisSnapshot {
  row_count: number;
  column_count: number;
  quality_score: number;

  missing: {
    total_missing_cells: number;
    missing_rate: number;
    by_column: Record<string, number>;
    columns_with_missing: string[];
  };

  duplicates: {
    total_duplicate_rows: number;
    unique_duplicate_groups: number;
    duplicate_rate: number;
    rows: number[];
  };

  anomalies: {
    total: number;
    by_type: Record<string, number>;
    by_column: Record<string, number>;
    details: {
      row: number;
      column: string;
      value: any;
      type: string;
      reason: string;
    }[];
  };

  types: Record<string, string>;
}
