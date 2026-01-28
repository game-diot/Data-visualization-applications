export interface AnalysisArtifactDTO {
  type: string; // e.g. "analysis_result_json"
  path: string;
  format?: string; // e.g. "json"
  sizeBytes?: number | null;
}

export interface AnalysisChartDTO {
  /**
   * chart-ready payload for frontend
   * type examples: "histogram" | "bar" | "line" | "scatter" | "heatmap" | "table"
   */
  type: string;
  title?: string;
  /** dataset payload is flexible; keep stable keys per chart type */
  data: any;
  meta?: Record<string, any>;
}

export interface AnalysisReportDTO {
  fileId: string;
  qualityVersion: number;
  cleaningVersion: number;
  analysisVersion: number;

  taskId: string;

  summary: any; // MVP: keep flexible (Mixed)
  charts: AnalysisChartDTO[]; // chart-ready
  modelResult?: any | null;
  artifacts?: AnalysisArtifactDTO[];

  logs: string[];
  createdAt: string; // ISO string
}
