import { AnalysisType } from "../constant/analysisiType.constant";

export interface AnalysisConfigDTO {
  type: AnalysisType;

  /** columns involved in analysis (names) */
  columns: string[];

  /** for supervised tasks (future) */
  target?: string | null;

  /** for group comparison */
  groupBy?: string | null;

  /** method-specific options */
  options?: Record<string, any>;
}
