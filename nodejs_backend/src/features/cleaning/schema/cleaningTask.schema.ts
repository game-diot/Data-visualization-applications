import { Schema } from "mongoose";
import { ICleaningTask } from "../models/interfaces/cleaningTask.interface";

export const CleaningTaskSchema = new Schema<ICleaningTask>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },

    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "CleaningSession",
      required: true,
      index: true,
    },

    qualityVersion: { type: Number, required: true },
    cleaningVersion: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "running", "success", "failed"],
      default: "pending",
      index: true,
    },

    errorMessage: { type: String },

    // 🛠️ 修复点：修改为 Mixed 类型，允许存储 JSON 对象
    errorDetail: { type: Schema.Types.Mixed },

    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true, collection: "cleaning_tasks" }
);

CleaningTaskSchema.index({ fileId: 1, cleaningVersion: 1 }, { unique: true });
