import { Schema } from "mongoose";
import { IUserMondification } from "../models/interfaces/userModification.interface";

export const userModificationSchema = new Schema<IUserMondification>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "CleaningSession",
      required: true,
      index: true,
    },
    fileId: { type: Schema.Types.ObjectId, ref: "File", required: true },

    // 👇 核心修改区域开始 👇
    diffList: [
      {
        // 1. 修改操作枚举：适配 FastAPI 约定的 update_cell, delete_row
        op: {
          type: String,
          enum: ["update_cell", "delete_row", "insert_row"],
          required: true,
        },

        // 2. 新增 rowId：这是必填项 (对应 FastAPI 的 row_id)
        rowId: { type: String, required: true },

        // 3. 新增 column：选填项 (因为 delete_row 不需要 column)
        column: { type: String, required: false },

        // 4. 移除 path：旧逻辑字段，不再需要 (如果非要保留兼容，请设为 required: false)
        // path: { type: String },

        // 5. 值变化字段保持不变
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },

        _id: false,
      },
    ],
    // 👆 核心修改区域结束 👆

    consumed: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "cleaning_user_modifications",
  }
);
