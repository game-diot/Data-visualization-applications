import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    originName: { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String },
    format: { type: String },
    uploadTime: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["uploaded", "parsed", "processed"],
      default: "uploaded",
    },
    description: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const File = mongoose.model("File", fileSchema);
