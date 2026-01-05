import { logger } from "@shared/utils/logger.util";
import { IQualityAnalysisResult } from "../models/interface/quality-result.interface";
import { eventBus } from "@app/core/eventBus.core";
import { FastApiQualityResponseDTO } from "../dto/analysisProtocol.dto";
import { fastApiClient } from "api/fastapi/clients/fastapiClient";
import { qualityReportRepository } from "../repository/qualityReport.repository";

export const qualityService = {
  /**
   * 核心：执行质量分析流程 (兼顾首次分析和重试)
   * 注意：必须传入 filePath，因为 Quality 模块不查 File 表
   */
  async performAnalysis(
    fileId: string,
    filePath: string,
    forceRefresh: boolean = false
  ): Promise<IQualityAnalysisResult> {
    logger.info(
      `🚀 [QualityService] Starting analysis for file: ${fileId} (Force: ${forceRefresh})`
    );

    // 1. 广播开始事件 (通知 File 模块更新状态为 analyzing)
    eventBus.emit("QUALITY_ANALYSIS_STARTED", { fileId });

    try {
      // 2. 调用 Python
      const fastApiResult: FastApiQualityResponseDTO =
        await fastApiClient.triggerAnalysis({
          file_id: fileId,
          file_path: filePath,
        });

      // 3. DTO 强转/映射
      const snapshot: IQualityAnalysisResult =
        fastApiResult as IQualityAnalysisResult;

      // 4. 保存完整历史记录
      await qualityReportRepository.createReport(fileId, snapshot);

      // 5. 广播完成事件 (通知 File 模块更新状态为 done 并保存摘要)
      eventBus.emit("QUALITY_ANALYSIS_COMPLETED", {
        fileId,
        result: snapshot,
      });

      logger.info(`√ [QualityService] Analysis successful: ${fileId}`);
      return snapshot;
    } catch (error: any) {
      const errorMessage = error.message || "Internal Analysis Error";

      // 6. 广播失败事件
      eventBus.emit("QUALITY_ANALYSIS_FAILED", {
        fileId,
        error: errorMessage,
      });

      logger.error(`❌ [QualityService] Failed: ${fileId}`, error);
      throw error;
    }
  },

  /**
   * 获取最新结果
   */
  async getLatestResult(fileId: string) {
    const report = await qualityReportRepository.findLatestByFileId(fileId);
    return report ? report.snapshot : null;
  },

  /**
   * 获取历史版本
   */
  async getResultByVersion(fileId: string, version: number) {
    const report = await qualityReportRepository.findByFileIdAndVersion(
      fileId,
      version
    );
    return report ? report.snapshot : null;
  },
};
