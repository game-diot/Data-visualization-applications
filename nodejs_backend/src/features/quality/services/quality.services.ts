import { logger } from "@shared/utils/logger.util";
import { IQualityAnalysisResult } from "../models/interface/quality-result.interface";
import { eventBus } from "@app/core/eventBus.core";
import { FastApiQualityResponseDTO } from "../dto/analysisProtocol.dto";
import { fastApiClient } from "api/fastapi/clients/fastapiClient";
import { qualityReportRepository } from "../repository/qualityReport.repository";
import { FastApiBusinessException } from "@shared/exceptions/fastApiBusiness.exception";
import { IAnalysisError } from "features/file/models/interface/ianalysisError.interface";

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
      const newReport = await qualityReportRepository.createReport(
        fileId,
        snapshot
      );

      // 5. 广播完成事件 (通知 File 模块更新状态为 done 并保存摘要)
      eventBus.emit("QUALITY_ANALYSIS_COMPLETED", {
        fileId,
        result: snapshot,
        version: newReport.version,
      });

      logger.info(`√ [QualityService] Analysis successful: ${fileId}`);
      return snapshot;
    } catch (error: any) {
      // 🛑 核心逻辑：构造结构化错误对象

      let errorCode = "UNKNOWN_ERROR";
      let errorMsg = error.message;
      let errorDetails = null;

      // 如果是我们封装的 FastAPI 异常，可以提取更详细的信息
      if (error instanceof FastApiBusinessException) {
        errorCode = error.errorCode.toString(); // e.g. "40004"
        errorMsg = error.message;
        errorDetails = error.details;
      } else if (error.code === "ECONNABORTED") {
        errorCode = "TIMEOUT";
        errorMsg = "Analysis service timed out";
      }

      const structuredError: IAnalysisError = {
        stage: "quality", // 明确标记是哪个阶段挂了
        code: errorCode,
        message: errorMsg,
        occurredAt: new Date(),
        details: errorDetails,
      };

      // 2. 广播失败事件 (携带结构化数据)
      eventBus.emit("QUALITY_ANALYSIS_FAILED", {
        fileId,
        error: structuredError,
      });

      logger.error(`❌ [QualityService] Failed: ${fileId}`, structuredError);
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
