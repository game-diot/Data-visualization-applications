export const ANALYSIS_TYPE = [
  "descriptive",
  "correlation",
  "group_compare",
] as const;

export type AnalysisType = (typeof ANALYSIS_TYPE)[number];
