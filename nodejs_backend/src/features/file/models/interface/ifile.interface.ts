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
  _id: mongoose.Types.ObjectId;
  // --- 基础元数据 ---
  name: string;
  storedName: string;
  path: string;
  size: number;
  mimetype: string;
  extension: string;
  userId?: string;
  hash?: string;
  stage: FileStage;
  fastApiFileId?: string;
  analysisError?: IAnalysisError | null;
  uploadedAt: Date;
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;
  latestQualityVersion?: number;
  qualityScore?: number; // 质量评分
  missingRate?: number; // 缺失率
  duplicateRate?: number; // 重复率
  totalRows?: number; // 总行数
  totalColumns?: number; // 总列数
  latestCleaningVersion?: number; //记录当前文件基于最新quality版本的最新cleaning版本
  isCleaned?: boolean; //标记是否已经清洗
  createdAt: Date;
  updatedAt: Date;
}

// =========================================================
// 2. Mongoose 文档类型 (IFileDocument)
// 职责：这是给 Service 和 Repository 用的类型。
// 它自动包含了 IFile 的数据 + .save(), .populate() 等方法。
// =========================================================
export type IFileDocument = HydratedDocument<IFile>;
