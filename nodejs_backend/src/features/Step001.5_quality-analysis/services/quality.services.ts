import { fileRepository } from "../../Step001_file-upload/repository/file.repository";
import { qualityReportRepository } from "../../file/repository/qualityReport.repository";
import { fastApiClient } from "../../../api/fastapi/clients/fastapiClient";
import { logger } from "../../../shared/utils/logger.util";
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception";
import { FastApiBusinessException } from "../../../shared/exceptions/fastApiBusiness.exception";
import { FastApiQualityResultDTO } from "../dto/fastapi-quality-result.dto";
import { FileStage } from "features/Step001_file-upload/models/File.model";
export interface QualityAnalysisStatus {
  stage:
    | "uploaded"
    | "quality_pending"
    | "quality_analyzing"
    | "quality_done"
    | "quality_failed";

  message: string;

  hasResult: boolean;

  updatedAt?: Date;
}

export const qualityService = {
  /**
   * 核心：执行质量分析流程
   */
  async performAnalysis(
    fileId: string,
    forceRefresh: boolean = true
  ): Promise<FastApiQualityResultDTO> {
    const file = await this._getFileOrThrow(fileId);
    logger.info(`🚀 [QualityService] Starting analysis for file: ${fileId}`);
    try {
      await this._updateFileStage(fileId, "quality_analyzing");

      // 调用 Python
      const fastApiResult = await fastApiClient.triggerAnalysis({
        file_id: fileId,
        file_path: file.path,
        force_refresh: forceRefresh,
      });

      // DTO -> Snapshot 映射
      const snapshot = this._mapDtoToSnapshot(fastApiResult);
      // 保存完整分析结果到 quality_reports
      await qualityReportRepository.createReport(fileId, snapshot);

      // 从 snapshot 提取 summary 更新 FileModel
      await fileRepository.updateById(fileId, {
        stage: "quality_done",
        qualityScore: snapshot.quality_score,
        total_missing_cells: snapshot.missing.total_missing_cells,
        missing_rate: snapshot.missing.missing_rate,
        total_duplicate_rows: snapshot.duplicates.total_duplicate_rows,
        duplicate_rate: snapshot.duplicates.duplicate_rate,
        anomalies_total: snapshot.anomalies.total,
        analysisCompletedAt: new Date(),
      });

      logger.info(
        `√ [QualityService]  analysis successful for file: ${fileId}`
      );
      return snapshot;
    } catch (error: any) {
      const message =
        error instanceof FastApiBusinessException
          ? error.message
          : `Internal Analysis Error: ${error.message}`;
      await this._updateFileStage(fileId, "quality_failed", message);
      logger.error(`❌ [QualityService] wrong analysis for file: ${fileId}`);
      throw error;
    }
  },

  /**
   * 获取结果
   */
  async getQualityResult(fileId: string) {
    // 1. 校验文件存在 & 状态
    const file = await this._getFileOrThrow(fileId);

    switch (file.stage) {
      case "quality_done": {
        // 2. 从质量报告表中读取结果
        const report = await qualityReportRepository.findLatestByFileId(fileId);

        if (!report) {
          // 理论上不该发生，防御性处理
          return {
            status: "processing",
            message: "分析结果尚未生成",
          };
        }

        return report;
      }

      case "quality_failed":
        return {
          status: "failed",
          message: file.errorMessage ?? "质量分析失败",
        };

      default:
        return {
          status: "processing",
          message: "质量分析进行中",
          stage: file.stage,
        };
    }
  },

  /**
   * 获取状态
   */

  async getAnalysisStatus(fileId: string): Promise<QualityAnalysisStatus> {
    // 1. 只查询必要字段
    const file = await this._getFileOrThrow(fileId);

    // 2. 根据 stage 映射质量分析状态
    switch (file.stage) {
      case "uploaded":
        return {
          stage: "uploaded",
          message: "文件已上传，尚未开始分析",
          hasResult: false,
          updatedAt: file.updatedAt,
        };

      case "quality_pending":
        return {
          stage: "quality_pending",
          message: "文件正在发送至分析服务",
          hasResult: false,
          updatedAt: file.updatedAt,
        };

      case "quality_analyzing":
        return {
          stage: "quality_analyzing",
          message: "质量分析进行中",
          hasResult: false,
          updatedAt: file.updatedAt,
        };

      case "quality_done":
        return {
          stage: "quality_done",
          message: "质量分析已完成",
          hasResult: true,
          updatedAt: file.analysisCompletedAt ?? file.updatedAt,
        };

      case "quality_failed":
        return {
          stage: "quality_failed",
          message: "质量分析失败，请重试",
          hasResult: false,
          updatedAt: file.updatedAt,
        };

      default:
        // 理论上不会发生，防御式编程
        return {
          stage: "quality_failed",
          message: "未知状态",
          hasResult: false,
          updatedAt: file.updatedAt,
        };
    }
  },

  /**
   * 重试分析
   */
  async retryAnalysis(fileId: string) {
    return this.performAnalysis(fileId, true);
  },

  // ==========================================
  // 私有辅助方法
  // ==========================================
  async _getFileOrThrow(fileId: string) {
    const file = await fileRepository.findById(fileId);
    if (!file) throw new FileNotFoundException(fileId);
    return file;
  },

  async _updateFileStage(
    fileId: string,
    stage: FileStage,
    errorMessage?: string
  ) {
    const update: Partial<{
      stage: FileStage;
      errorMessage: string;
      analysisStartedAt: Date;
      analysisCompletedAt: Date;
    }> = { stage };
    if (stage === "quality_analyzing") update.analysisStartedAt = new Date();
    if (stage === "quality_done") update.analysisCompletedAt = new Date();
    if (stage === "quality_failed" && errorMessage)
      update.errorMessage = errorMessage;
    return fileRepository.updateById(fileId, update);
  },

  _mapDtoToSnapshot(dto: FastApiQualityResultDTO) {
    // 这里可以处理 DTO -> Snapshot 映射逻辑，比如:
    // - 类型安全检查
    // - 字段过滤/重命名
    // - 版本控制字段等
    return dto; // 现在直接返回，但可以扩展
  },
};
