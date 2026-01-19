// src/models/interfaces/userModification.interface.ts

import { Document, Types } from "mongoose";

export interface IDiffItem {
  op: "update_cell" | "delete_row" | "insert_row"; // 更新枚举
  rowId: string; // 新增
  column?: string; // 新增 (可选)
  before?: any;
  after?: any;
  // path?: string;  // 移除或设为可选
}

export interface IUserMondification extends Document {
  sessionId: Types.ObjectId;
  fileId: Types.ObjectId;
  diffList: IDiffItem[];
  consumed: boolean;
  createdAt: Date;
}
