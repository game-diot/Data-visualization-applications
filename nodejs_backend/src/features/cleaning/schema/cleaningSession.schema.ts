import { Mongoose, Schema } from "mongoose";
import { ICleaningSession } from "../models/interfaces/cleaningSession.interface";

export const CleaningSessionSchema = new Schema<ICleaningSession>(
  {
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },

    // 绑定的 Quality 版本，防止“偷偷跨版本”清洗
    qualityVersion: { type: Number, required: true },

    // 当前 Session 下最新 version，由 Service 层维护
    latestCleaningVersion: { type: Number, default: 0 },
    cleanRules: {
      missing: { type: Schema.Types.Mixed, default: {} },
      deduplicate: { type: Schema.Types.Mixed, default: {} },
      typeCast: { type: Schema.Types.Mixed, default: {} },
      outliers: { type: Schema.Types.Mixed, default: {} },
      filter: { type: Schema.Types.Mixed, default: {} },
    },

    status: {
      type: String,
      enum: ["draft", "running", "closed"],
      default: "draft",
      index: true,
    },
    lockedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true, collection: "cleaning_sessions" }
);

// 复合索引：快速定位某文件某次体检的清洗会话
CleaningSessionSchema.index(
  { fileId: 1, qualityVersion: 1, status: 1 },
  { unique: false }
); // 允许存在多个 active session 吗？通常建议一个 qualityVersion 对应一个 active session
