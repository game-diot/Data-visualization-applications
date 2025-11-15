import mongoose from "mongoose";

const qualityResultSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    // FastAPI 计算出的总得分（0 - 100）
    score: {
      type: Number,
      required: true,
    },

    // 缺失值统计，例如：{ age: 0.12, salary: 0.03 }
    missing: {
      type: Object,
      default: {},
    },

    // 重复行数量
    duplicates: {
      type: Number,
      default: 0,
    },

    // 异常值信息
    outliers: {
      type: Object,
      default: {},
    },

    // 字段类型，例如：{ age: "int", name: "string" }
    types: {
      type: Object,
      default: {},
    },

    // 前 N 行的预览数据
    preview: {
      type: Array,
      default: [],
    },

    // FastAPI 原始响应（可选，方便调试）
    raw: {
      type: Object,
      default: {},
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const QualityResult = mongoose.model(
  "QualityResult",
  qualityResultSchema
);
