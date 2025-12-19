import { FastApiQualityAnalysisResultDTO } from "../models/QualityResult.model";

export class QualityRepository {
  /**
   * 写入新的质量分析结果（若已存在，则覆盖）
   */
  async createQualityAnalysis(
    payload: FastApiQualityAnalysisResultDTO
  ): Promise<FastApiQualityAnalysisResultDTO> {
    const result = await findOneAndUpdate
      .findOneAndUpdate(
        { fileId: payload.file_id },
        { $set: payload },
        { new: true, upsert: true } // 不存在则创建，存在则覆盖
      )
      .lean();

    return result as FastApiQualityAnalysisResultDTO;
  }

  /**
   * 更新质量分析结果（只更新指定字段）
   */
  async updateQualityAnalysis(
    fileId: string,
    updates: Partial<FastApiQualityAnalysisResultDTO>
  ): Promise<FastApiQualityAnalysisResultDTO | null> {
    const result = await QualityResult.findOneAndUpdate(
      { fileId },
      { $set: updates },
      { new: true }
    ).lean();

    return result as FastApiQualityAnalysisResultDTO | null;
  }

  /**
   * 根据 fileId 获取质量分析结果
   */
  async getQualityAnalysis(
    fileId: string
  ): Promise<FastApiQualityAnalysisResultDTO | null> {
    const result = await QualityResult.findOne({ fileId }).lean();
    return result as FastApiQualityAnalysisResultDTO | null;
  }
}

export const qualityRepository = new QualityRepository();
