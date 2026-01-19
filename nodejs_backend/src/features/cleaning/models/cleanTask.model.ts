import mongoose from "mongoose";
import { CleaningTaskSchema } from "../schema/cleaningTask.schema";
import { ICleaningTask } from "./interfaces/cleaningTask.interface";

export const CleaningTaskModel = mongoose.model<ICleaningTask>(
  "CleaningTask",
  CleaningTaskSchema
);
