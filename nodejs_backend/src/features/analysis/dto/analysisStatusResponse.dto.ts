import type { AnalysisTaskSummaryDTO } from "./analysisTaskSummary.dto";
import type { AnalysisReportSummaryDTO } from "./analysisReportSummary.dto";

export interface AnalysisStatusResponseDTO {
  fileId: string;
  qualityVersion: number;
  cleaningVersion: number;

  currentTask: AnalysisTaskSummaryDTO | null;
  latestTask: AnalysisTaskSummaryDTO | null;
  latestReport: AnalysisReportSummaryDTO | null;
}
