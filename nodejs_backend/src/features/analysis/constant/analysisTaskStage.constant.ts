export const ANALYSIS_TASK_STAGE = [
  "received",
  "load",
  "validate",
  "process",
  "export",
  "done",
  "unknown",
] as const;

export type AnalysisTaskStage = (typeof ANALYSIS_TASK_STAGE)[number];
