import { eventBus } from "@app/core/eventBus.core";
import { logger } from "@shared/utils/logger.util";
import { fileRepository } from "../repository/file.repository";

/**
 * 初始化 File 模块的事件订阅
 * 在 app 启动时调用
 */
export function setupFileSubscribers() {
  logger.info("🎧 [FileSubscriber] Listening for events...");

  // ==========================================
  // 1. 监听：分析开始
  // ==========================================
  eventBus.on("QUALITY_ANALYSIS_STARTED", async ({ fileId }) => {
    try {
      logger.info(`📨 [Event] Received QUALITY_ANALYSIS_STARTED for ${fileId}`);

      await fileRepository.updateById(fileId, {
        stage: "quality_analyzing",
        analysisStartedAt: new Date(),
      });
    } catch (error) {
      logger.error(
        `❌ [Event Error] Failed to handle STARTED event for ${fileId}`,
        error
      );
    }
  });

  // ==========================================
  // 2. 监听：分析完成 (核心)
  // ==========================================
  eventBus.on("QUALITY_ANALYSIS_COMPLETED", async ({ fileId, result }) => {
    try {
      logger.info(
        `📨 [Event] Received QUALITY_ANALYSIS_COMPLETED for ${fileId}`
      );

      // 这里的 result 是 IQualityAnalysisResult 接口
      // 直接存入 file.analysisResult 字段
      await fileRepository.updateById(fileId, {
        stage: "quality_done",
        analysisCompletedAt: new Date(),
        analysisResult: result, // Mongoose 会自动处理嵌套文档
      });

      logger.info(`💾 [DB] File ${fileId} stage updated to 'quality_done'`);
    } catch (error) {
      logger.error(
        `❌ [Event Error] Failed to handle COMPLETED event for ${fileId}`,
        error
      );
    }
  });

  // ==========================================
  // 3. 监听：分析失败
  // ==========================================
  eventBus.on("QUALITY_ANALYSIS_FAILED", async ({ fileId, error }) => {
    try {
      logger.info(`📨 [Event] Received QUALITY_ANALYSIS_FAILED for ${fileId}`);

      await fileRepository.updateById(fileId, {
        stage: "quality_failed",
        errorMessage: error,
      });
    } catch (err) {
      logger.error(
        `❌ [Event Error] Failed to handle FAILED event for ${fileId}`,
        err
      );
    }
  });
}
