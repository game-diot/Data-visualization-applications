import { QualityReportModel } from "../models/qualityReport.model";
import { QualityAnalysisSnapshot } from "../types/quality-snapshot.type";

export class QualityReportRepository {
  /**
   * 保存一次新的质量分析结果（版本化）
   */
  async createReport(fileId: string, snapshot: QualityAnalysisSnapshot) {
    const last = await QualityReportModel.findOne({ fileId })
      .sort({ version: -1 })
      .lean<{ version: number } | null>();

    const version = last ? last.version + 1 : 1;

    return QualityReportModel.create({
      fileId,
      version,
      snapshot,
    });
  }

  /**
   * 获取最新版本的分析结果
   */
  async findLatestByFileId(fileId: string) {
    return QualityReportModel.findOne({ fileId }).sort({ version: -1 }).lean();
  }

  /**
   * 获取指定版本
   */
  async findByFileIdAndVersion(fileId: string, version: number) {
    return QualityReportModel.findOne({ fileId, version }).lean();
  }

  /**
   * 删除某个文件的所有质量分析记录（用于重试 / 文件硬删除）
   */
  async deleteByFileId(fileId: string): Promise<number> {
    const result = await QualityReportModel.deleteMany({ fileId });
    return result.deletedCount ?? 0;
  }
}

export const qualityReportRepository = new QualityReportRepository();
