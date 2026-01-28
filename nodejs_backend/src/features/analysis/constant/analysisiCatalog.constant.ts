import type { AnalysisType } from "./analysisiType.constant";

export interface CatalogRequirement {
  /**
   * 是否需要最少列数
   */
  minColumns?: number;

  /**
   * 对 selected columns 的 dtype 约束（基于 ColumnProfile）
   */
  minNumeric?: number;
  minCategorical?: number;
  minDatetime?: number;

  /**
   * 是否需要额外配置项（UI 用）
   */
  requiresConfig?: Array<"groupBy" | "target">;

  /**
   * 说明（UI 用）
   */
  description?: string;
}

export interface AnalysisCatalogItem {
  type: AnalysisType;
  label: string;
  requirements: CatalogRequirement;
}

/**
 * MVP 先支持 3 个分析类型
 */
export const ANALYSIS_CATALOG: AnalysisCatalogItem[] = [
  {
    type: "descriptive",
    label: "描述统计",
    requirements: {
      minColumns: 1,
      description: "查看数据分布、频数、基本统计指标。",
    },
  },
  {
    type: "correlation",
    label: "相关性分析",
    requirements: {
      minColumns: 2,
      minNumeric: 2,
      description: "需要至少2个数值列，用于计算相关系数与热力图。",
    },
  },
  {
    type: "group_compare",
    label: "分组对比",
    requirements: {
      minColumns: 2,
      minNumeric: 1,
      minCategorical: 1,
      requiresConfig: ["groupBy", "target"],
      description: "按类别列分组，对比数值列（均值/中位数/箱线图等）。",
    },
  },
];
