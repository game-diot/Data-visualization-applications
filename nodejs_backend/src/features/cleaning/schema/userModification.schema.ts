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

    diffList: [
      {
        // 1. 修改操作枚举：适配 FastAPI 约定的 update_cell, delete_row
        op: {
          type: String,
          enum: ["update_cell", "delete_row", "insert_row"],
          required: true,
        },

        // 2. rowId：这是必填项 (对应 FastAPI 的 row_id)
        rowId: { type: String, required: true },

        // 3. column：选填项 (因为 delete_row 不需要 column)
        column: { type: String, required: false },
        before: { type: Schema.Types.Mixed },
        after: { type: Schema.Types.Mixed },

        _id: false,
      },
    ],

    consumed: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "cleaning_user_modifications",
  },
);
