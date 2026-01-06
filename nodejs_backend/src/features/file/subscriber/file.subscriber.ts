import { eventBus } from "@app/core/eventBus.core";
import { logger } from "@shared/utils/logger.util";
import { fileRepository } from "../repository/file.repository";
import { IAnalysisError } from "../models/interface/ianalysisError.interface";
import { qualityService } from "features/quality/services/quality.services";
/**
 * 初始化 File 模块的事件订阅
 * 在 app 启动时调用
 */
export function setupFileSubscribers() {
  logger.info("🎧 [FileSubscriber] Listening for events...");

  eventBus.on("FILE_UPLOADED", async ({ fileId, filePath }) => {
    logger.info(
      `📨 [Event] Received FILE_UPLOADED for ${fileId}, triggering analysis...`
    );

    // ⚡️ 异步触发质量分析 (Fire and Forget)
    // 这里不需要 await，因为我们不想阻塞 EventBus 的其他处理，
    // 而且 performAnalysis 内部已经处理了 try-catch 和 错误状态更新
    qualityService.performAnalysis(fileId, filePath, true).catch((err) => {
      // 这里的 catch 是为了兜底，防止极个别情况下的未捕获异常导致进程崩溃
      logger.error(
        `❌ [QualitySubscriber] Critical error starting analysis for ${fileId}`,
        err
      );
    });
  });

  // ==========================================
  // 1. 监听：分析开始
  // ==========================================
  eventBus.on("QUALITY_ANALYSIS_STARTED", async ({ fileId }) => {
    try {
      logger.info(`📨 [Event] Received QUALITY_ANALYSIS_STARTED for ${fileId}`);

      await fileRepository.updateById(fileId, {
        stage: "quality_analyzing",
        analysisStartedAt: new Date(),
        analysisError: undefined,
      });
    } catch (error) {
      logger.error(
        `❌ [Event Error] Failed to handle STARTED event for ${fileId}`,
        error
      );
    }
  });

  // ==========================================
  // 2. 监听：分析完成 (核心适配 Model 变更)
  // ==========================================
  eventBus.on(
    "QUALITY_ANALYSIS_COMPLETED",
    async ({ fileId, result, version }) => {
      try {
        logger.info(
          `📨 [Event] Received QUALITY_ANALYSIS_COMPLETED for ${fileId} (v${version})`
        );

        // 🛠️ 提取摘要数据 (Mapping)
        // 从庞大的 result 对象中，只拿走几个关键数字
        await fileRepository.updateById(fileId, {
          stage: "quality_done",
          analysisCompletedAt: new Date(),

          // ⭐️ 填充新的摘要字段
          latestQualityVersion: version, // 记录当前最新版本
          qualityScore: result.quality_score,
          missingRate: result.missing.missing_rate,
          duplicateRate: result.duplicates.duplicate_rate,
          totalRows: result.row_count,
          totalColumns: result.column_count,

          // 清除之前的错误信息（如果有）
          analysisError: null,
        });

        logger.info(
          `💾 [DB] File ${fileId} updated with Quality Summary (v${version})`
        );
      } catch (error) {
        logger.error(
          `❌ [Event Error] Failed to handle COMPLETED event for ${fileId}`,
          error
        );
      }
    }
  );

  // ==========================================
  // 3. 监听：分析失败
  // ==========================================
  eventBus.on("QUALITY_ANALYSIS_FAILED", async ({ fileId, error }) => {
    try {
      logger.info(`📨 [Event] Received QUALITY_ANALYSIS_FAILED for ${fileId}`);

      await fileRepository.updateById(fileId, {
        stage: "quality_failed",
        analysisError: error,
      });
    } catch (err) {
      logger.error(
        `❌ [Event Error] Failed to handle FAILED event for ${fileId}`,
        err
      );
    }
  });
}
