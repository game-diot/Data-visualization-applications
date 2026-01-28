import { required } from "joi";
import { Schema } from "mongoose";

export const DataRefSchema = new Schema(
  {
    type: { type: String, required: true, enum: ["local_file", "s3", "oss"] },
    path: { type: String, required: true },
    format: {
      type: String,
      required: true,
      enum: ["csv", "xlsx", "parquet", "json"],
      default: "csv",
    },
    encoding: { type: String, default: "utf-8" },
    delimiter: { type: String, default: null },
    sheetName: { type: String, default: null },
  },
  { _id: false },
);
