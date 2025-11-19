import mongoose, { Document, Schema, Model } from "mongoose";

// 1. 定义纯数据接口 (不包含 Mongoose 的方法，如 save, remove 等)
// 这也是你以后可以用在 DTO 里的结构
export interface IFile {
  name: string;
  storedName: string;
  path: string;
  size: number;
  type?: string;
  totalRows?: number;
  totalCols?: number;
  uploadTime?: Date;
  stage?: "uploaded" | "parsed" | "processed";
}

// 2. 定义 Document 接口 (数据 + Mongoose 方法 + _id)
// 继承 IFile 获得数据字段，继承 Document 获得 save() 等方法
export interface IFileDocument extends IFile, Document {
  _id: mongoose.Types.ObjectId; // 👈 显式定义 _id 类型，解决 unknown 问题
  createdAt: Date; // 显式定义 timestamps
  updatedAt: Date;
}

// 3. Mongoose Schema
const fileSchema = new Schema<IFileDocument>(
  {
    name: { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String },
    totalRows: { type: Number, default: 0 },
    totalCols: { type: Number, default: 0 },
    uploadTime: { type: Date, default: Date.now },
    stage: {
      type: String,
      enum: ["uploaded", "parsed", "processed"],
      default: "uploaded",
    },
  },
  { timestamps: true }
);

// 4. 导出 Model
// 泛型传入 IFileDocument，这样 Model.findOne() 返回的就是 IFileDocument 类型
export const File: Model<IFileDocument> = mongoose.model<IFileDocument>(
  "File",
  fileSchema
);
