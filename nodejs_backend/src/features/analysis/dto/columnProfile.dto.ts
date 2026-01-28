export type ColumnDType = "numeric" | "categorical" | "datetime" | "unknown";

export interface ColumnProfileDTO {
  name: string;
  dtype: ColumnDType;
  /**
   * MVP 先不算 stats（只做 dtype 与可用性判断）
   * 后续想做 stats 再扩展
   */
  stats?: {
    count?: number;
    missingRate?: number;
    uniqueCount?: number;
    min?: number | string;
    max?: number | string;
    mean?: number;
    topValues?: Array<{ value: any; count: number }>;
  };
}
