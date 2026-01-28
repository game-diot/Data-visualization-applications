export const ANALYSIS_TASK_STATUS = [
  "pending",
  "running",
  "success",
  "failed",
] as const;

export type AnalysisTaskStatus = (typeof ANALYSIS_TASK_STATUS)[number];
