import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 原始文件名
    storedName: { type: String, required: true, unique: true }, // 服务器文件名
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

export const File = mongoose.model("File", fileSchema);
