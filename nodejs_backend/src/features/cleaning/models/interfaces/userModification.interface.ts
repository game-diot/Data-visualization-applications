// src/models/interfaces/userModification.interface.ts

import { Document, Types } from "mongoose";

export interface IDiffItem {
  op: "update_cell" | "delete_row" | "insert_row";
  rowId: string;
  column?: string;
  before?: any;
  after?: any;
}

export interface IUserMondification extends Document {
  sessionId: Types.ObjectId;
  fileId: Types.ObjectId;
  diffList: IDiffItem[];
  consumed: boolean;
  createdAt: Date;
}
