import type { AnalysisTaskStage } from "../constant/analysisTaskStage.constant";
import type { AnalysisTaskStatus } from "../constant/analysisTaskStatus.constant";

export interface AnalysisTaskSummaryDTO {
  taskId: string;
  status: AnalysisTaskStatus;
  stage: AnalysisTaskStage;

  analysisVersion: number;

  startedAt?: string | null;
  finishedAt?: string | null;

  errorMessage?: string | null;
}
