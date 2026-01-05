import mongoose, { FilterQuery } from "mongoose";
import { QualityReportModel } from "../models/qualityReport.model";
import {
  IQualityAnalysisResult,
  IQualityReport,
} from "../models/interface/quality-result.interface";

export class QualityReportRepository {
  /**
   * 保存一次新的质量分析结果（自动递增版本）
   */
  async createReport(
    fileId: string,
    snapshot: IQualityAnalysisResult
  ): Promise<IQualityReport> {
    // 1. 查找当前该文件的最大版本号
    const lastReport = await QualityReportModel.findOne({ fileId })
      .sort({ version: -1 })
      .select("version") // 只查 version 字段，省流量
      .lean<{ version: number }>();

    const nextVersion = lastReport ? lastReport.version + 1 : 1;

    // 2. 创建新记录
    return QualityReportModel.create({
      fileId, // Mongoose 会自动将 string 转换为 ObjectId
      version: nextVersion,
      snapshot,
    });
  }

  /**
   * 获取最新版本的分析结果
   */
  async findLatestByFileId(fileId: string): Promise<IQualityReport | null> {
    return QualityReportModel.findOne({
      // 🛑 显式转换：确保用 ObjectId 去查
      fileId: new mongoose.Types.ObjectId(fileId),
    })
      .sort({ version: -1 })
      .lean<IQualityReport>();
  }

  /**
   * 获取指定版本
   */
  async findByFileIdAndVersion(
    fileId: string,
    version: number
  ): Promise<IQualityReport | null> {
    return QualityReportModel.findOne({
      fileId: new mongoose.Types.ObjectId(fileId), // 🛑 显式转换
      version,
    }).lean<IQualityReport>();
  }
  /**
   * 删除某个文件的所有质量分析记录
   * 场景：文件被硬删除时调用
   */
  async deleteByFileId(fileId: string): Promise<number> {
    const result = await QualityReportModel.deleteMany({ fileId });
    return result.deletedCount;
  }
}

export const qualityReportRepository = new QualityReportRepository();
