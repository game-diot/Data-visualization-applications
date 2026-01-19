import { CleaningSessionStatus } from "features/cleaning/constant/cleaningSessionStatus.constant";
import { CleaningTaskStatus } from "features/cleaning/constant/cleaningTaskStatus.constant";
import mongoose from "mongoose";

export interface ICleaningTask {
  fileId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;

  qualityVersion: number;
  cleaningVersion: number; // 本次尝试的目标版本号

  status: CleaningTaskStatus;

  errorMessage?: string;
  errorDetail?: any;

  startedAt?: Date;
  finishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
