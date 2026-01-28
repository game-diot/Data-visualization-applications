import { AnalysisTaskStage } from "features/analysis/constant/analysisTaskStage.constant";
import { AnalysisTaskStatus } from "features/analysis/constant/analysisTaskStatus.constant";
import { AnalysisConfigDTO } from "features/analysis/dto/analysisConfig.dto";
import { DataRefDTO } from "features/analysis/dto/dataRef.dto";
import { DataSelectionDTO } from "features/analysis/dto/dataSelection.dto";
import mongoose from "mongoose";

export interface IAnalysisError {
  stage: AnalysisTaskStage;
  code: string;
  message: string;
  detail?: any;
  retryable: boolean;
  occurredAt: Date;
}

export interface IAnalysisTask extends Document {
  _id: mongoose.Types.ObjectId;
  fileId: mongoose.Types.ObjectId;
  qualityVersion: number;
  cleaningVersion: number;
  analysisVersion: number;
  dataRef: DataRefDTO;
  dataSelection?: DataSelectionDTO | null;
  analysisConfig: AnalysisConfigDTO;
  status: AnalysisTaskStatus;
  stage: AnalysisTaskStage;

  startedAt?: Date | null;
  finishedAt?: Date | null;

  error?: IAnalysisError | null;
  createdAt: Date;
  updatedAt: Date;
}
