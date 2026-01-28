import type { DataSelectionDTO } from "./dataSelection.dto";
import type { AnalysisConfigDTO } from "./analysisConfig.dto";
import type { AnalysisTaskSummaryDTO } from "./analysisTaskSummary.dto";

export interface AnalysisRunResponseDTO {
  task: AnalysisTaskSummaryDTO;
}

export interface AnalysisRunRequestDTO {
  qualityVersion: number;

  /**
   * default: use cleaned input
   * if raw mode: set input="raw" and cleaningVersion=0 (or null by convention)
   */
  cleaningVersion?: number | null;

  input?: "cleaned" | "raw";

  dataSelection?: DataSelectionDTO | null;

  analysisConfig: AnalysisConfigDTO;
}
