import mongoose, { mongo } from "mongoose";
import { CleaningReportModel } from "../models/cleanReport.model";
import { ICleaningReport } from "../models/interfaces/cleaningReport.interface";

export class CleaningReportRepository {
  /**
   * 创建 Report
   */
  async create(data: Partial<ICleaningReport>): Promise<ICleaningReport> {
    return CleaningReportModel.create(data);
  }
  /**
   * 获取最新 Report
   * 用于 Analysis 模块获取最新数据入口
   */
  async findLatest(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number
  ): Promise<ICleaningReport | null> {
    return CleaningReportModel.findOne({ fileId, qualityVersion })
      .sort({
        cleaningVersion: -1,
      })
      .lean();
  }
  /**
   * 精确获取某版本
   * 用于回溯/对比
   */
  async findByVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number,
    cleaningVersion: number
  ): Promise<ICleaningReport | null> {
    return CleaningReportModel.findOne({
      fileId,
      qualityVersion,
      cleaningVersion,
    }).lean();
  }
  /**
   * 获取 Session 下的所有 Report
   * 用于前端展示历史记录
   */
  async findBySession(
    sessionId: mongoose.Types.ObjectId
  ): Promise<ICleaningReport | null> {
    return CleaningReportModel.findOne({ sessionId })
      .sort({ cleaningVersion: -1 })
      .lean();
  }

  async listByQualityVersion(
    fileId: mongoose.Types.ObjectId,
    qualityVersion: number
  ) {
    return CleaningReportModel.find({ fileId, qualityVersion })
      .sort({ cleaningVersion: -1 })
      .select("-detailLog -cleanedFilePath") // ❌ 排除重字段
      .lean();
  }
}

export const cleaningReportRepository = new CleaningReportRepository();
