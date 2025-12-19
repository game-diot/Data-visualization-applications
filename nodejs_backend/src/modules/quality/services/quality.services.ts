// src/modules/quality/services/quality.service.ts
import { File } from "../../file-upload/models/File.model";
import { QualityResult } from "../models/QualityResult.model.js";
import { fastApiClient } from "../../../api/fastapi/clients/fastapiClient";
import { logger } from "@app/config/logger.config.js";
import { QualityResultDTO } from "../dto/QualityResult.dto";

export class QualityService {
  /**
   * 触发质量分析
   */
  static async triggerAnalysis(fileId: string, force_refresh: boolean) {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    // 更新文件状态为 analyzing
    file.stage = "analyzing";
    file.analysisStartedAt = new Date();
    await file.save();

    try {
      // 上传文件到 FastAPI
      const fastApiResponse: QualityResultDTO = await fastApiClient.post(
        "/api/upload/",
        {
          path: file.path,
        }
      );

      const fastApiFileId = fastApiResponse.file_id;
      file.id = fastApiFileId;
      await file.save();

      // 调用分析接口
      const analysisResult = await fastApiClient.post("/api/quality/analyze", {
        file_id: fastApiFileId,
        sample_rows: 100,
      });

      // 保存结果到 QualityResult
      const qualityDoc = await QualityResult.create({
        fileId: file._id,
        ...analysisResult,
        analyzedAt: new Date(),
        fastApiResponse,
      });

      // 更新文件状态
      file.stage = "analyzed";
      file.analysisCompletedAt = new Date();
      await file.save();

      logger.info(`[QualityService] Analysis completed for file ${fileId}`);
      return qualityDoc;
    } catch (err) {
      logger.error(`[QualityService] Analysis failed for file ${fileId}`, err);
      file.stage = "failed";
      await file.save();
      throw err;
    }
  }

  /**
   * 获取质量结果
   */
  static async getQualityResult(fileId: string, userId?: string) {
    const result = await QualityResult.findOne({ fileId });
    if (result) return result;

    const file = await File.findById(fileId);
    if (!file) return { status: "not_found" };

    switch (file.stage) {
      case "uploaded":
        return { status: "pending" };
      case "analyzing":
        return { status: "processing" };
      case "failed":
        return { status: "failed" };
      default:
        return { status: "unknown" };
    }
  }

  /**
   * 重试分析
   */
  static async retryAnalysis(fileId: string, userId?: string) {
    await QualityResult.deleteMany({ fileId });
    const file = await File.findById(fileId);
    if (!file) throw new Error(`File not found: ${fileId}`);

    file.stage = "uploaded";
    file.analysisStartedAt = null;
    file.analysisCompletedAt = null;
    await file.save();

    return this.triggerAnalysis(fileId, true);
  }
}
