// =========================================================
// 1. 纯数据接口 (IFile)
// 用于：DTO、Service内部逻辑、.lean() 查询结果
// 特点：不包含 .save(), .update() 等 Mongoose 方法，只包含数据

import { FileStage } from "features/file/constant/file-stage.constant";
import mongoose, { HydratedDocument } from "mongoose";
import { IQualityAnalysisResult } from "../../../quality/models/interface/quality-result.interface";
import { IAnalysisError } from "./ianalysisError.interface";
// =========================================================
// 1. 纯数据接口 (IFile)
// 职责：定义数据库里实际存的字段。
// 注意：不要在这里 extends Document，只定义数据！
// =========================================================
export interface IFile {
  // 我们手动声明 _id，以便在 lean() 查询时也能获得代码提示
  _id: mongoose.Types.ObjectId;

  // --- 基础元数据 ---
  name: string;
  storedName: string;
  path: string;
  size: number;
  mimetype: string;
  extension: string;

  // --- 归属 ---
  userId?: string;
  hash?: string;

  // --- 状态 ---
  stage: FileStage;

  // --- 外部关联 ---
  fastApiFileId?: string;
  // ✅ 新增：结构化错误对象
  analysisError?: IAnalysisError;

  // --- 时间 ---
  uploadedAt: Date;
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;

  // 用于列表页展示 & Cleaning 模块快速读取
  latestQualityVersion?: number; // 指向 QualityReport 的 version
  qualityScore?: number; // 质量评分
  missingRate?: number; // 缺失率
  duplicateRate?: number; // 重复率
  totalRows?: number; // 总行数
  totalColumns?: number; // 总列数

  // --- 自动字段 (Mongoose timestamps) ---
  createdAt: Date;
  updatedAt: Date;
}

// =========================================================
// 2. Mongoose 文档类型 (IFileDocument)
// 职责：这是给 Service 和 Repository 用的类型。
// 它自动包含了 IFile 的数据 + .save(), .populate() 等方法。
// =========================================================
export type IFileDocument = HydratedDocument<IFile>;
