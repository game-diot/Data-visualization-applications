// =========================================================
// 1. 纯数据接口 (IFile)
// 用于：DTO、Service内部逻辑、.lean() 查询结果
// 特点：不包含 .save(), .update() 等 Mongoose 方法，只包含数据

import { FileStage } from "features/file/constant/file-stage.constant";
import mongoose, { HydratedDocument } from "mongoose";
import { IQualityAnalysisResult } from "../../../Step001.5_quality-analysis/models/interface/quality-result.interface";
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
  errorMessage?: string;

  // --- 时间 ---
  uploadedAt: Date;
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;

  // --- 业务数据 ---
  analysisResult?: IQualityAnalysisResult;

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
