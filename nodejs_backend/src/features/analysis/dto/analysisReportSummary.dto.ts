export interface AnalysisReportSummaryDTO {
  reportId: string;
  analysisVersion: number;
  createdAt: string;

  // summary can be large; list endpoint can return a tiny subset
  summary?: any;

  hasArtifacts: boolean;
}
