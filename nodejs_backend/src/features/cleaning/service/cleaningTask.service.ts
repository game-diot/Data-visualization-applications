import mongoose from "mongoose";
import { cleaningTaskRepository } from "../repository/cleaningTask.repository";
import { cleaningSessionRepository } from "../repository/cleaningSession.repository";
import { userModificationRepository } from "../repository/userModification.repository";
import { fileRepository } from "../../file/repository/file.repository";
import { fastApiClient } from "../../../api/fastapi/clients/fastapiClient";
import { logger } from "../../../shared/utils/logger.util";
import { BadRequestException } from "../../../shared/exceptions/badRequest.exception";
import { ICleaningTask } from "../models/interfaces/cleaningTask.interface";
import { cleaningReportService } from "./cleaningReport.service";
import { ICleaningError } from "../models/interfaces/cleaningError.interface";
import { cleaningReportRepository } from "../repository/cleaningReport.repository";

// 假设 Report Service 稍后开发
// import { cleaningReportService } from "./cleaning-report.service";

export const cleaningTaskService = {
  /**
   * 🟢 触发清洗 (对外入口)
   */
  async triggerCleaning(
    fileId: string,
    sessionId: string,
    cleanRules: any // 虽然通常规则在 Session 里，但也允许覆盖或传递
  ) {
    const fId = new mongoose.Types.ObjectId(fileId);
    const sId = new mongoose.Types.ObjectId(sessionId);

    // 1. 校验 & 锁定 Session
    const session = await cleaningSessionRepository.findActiveById(sId);
    if (
      !session ||
      session.fileId.toString() !== fileId || // 安全校验
      session.status === "closed"
    ) {
      throw new BadRequestException("Session is not available or mismatch");
    }

    // 乐观锁：如果已经是 running，可能不允许重复触发？或者允许并发？
    // 这里假设：一次只能跑一个任务，防止前端狂点
    await cleaningSessionRepository.lockedSession(sId);

    // 2. 准备数据
    const modifications = await userModificationRepository.findBySessionId(sId);
    // 这里需要将 DB 里的 Mod 转换为 FastAPI 需要的 DTO 格式
    const actionsPayload = modifications.flatMap((m) => m.diffList);

    // 3. 计算版本
    const cleaningVersion = await cleaningTaskRepository.getNextCleaningVersion(
      fId,
      session.qualityVersion
    );

    // 4. 创建 Task (Pending)
    const task = await cleaningTaskRepository.create({
      fileId: fId,
      sessionId: sId,
      qualityVersion: session.qualityVersion,
      cleaningVersion: cleaningVersion,
      status: "pending",
    });

    // 5. 更新 File 状态 (让前端看到转圈圈)
    await fileRepository.updateById(fileId, { stage: "cleaning_processing" });

    // 6. 🔥 异步执行 (Fire-and-Forget)
    // 注意：这里不 await，直接返回 task 给前端
    await this._executeCleaningTask(task, actionsPayload).catch((err) =>
      logger.error(
        `❌ [Cleaning] Async execution failed for task ${task.fileId}`,
        err
      )
    );

    return task;
  },

  /**
   * 🟡 内部执行逻辑 (增强错误处理)
   */
  async _executeCleaningTask(task: ICleaningTask, userActions: any[]) {
    try {
      logger.info(`🚀 [Cleaning] Start execution for Task ${task.sessionId}`);

      // 1. Prepare Prerequisites (File & Session)
      const [file, session] = await Promise.all([
        fileRepository.findById(String(task.fileId)),
        cleaningSessionRepository.findActiveById(task.sessionId),
      ]);

      if (!file) throw new Error(`File not found: ${task.fileId}`);
      if (!session)
        throw new Error(`Active session not found: ${task.sessionId}`);

      // 2. Construct FastAPI Payload (CamelCase -> SnakeCase)
      const payload = {
        file_id: task.fileId.toString(),
        data_ref: {
          // Ensure id is not included if FastAPI strictly forbids extra fields
          // id: file._id.toString(),
          path: file.path || file.path, // Assuming file.path holds the correct URI
          type: "local_file",
        },
        // 映射 User Actions
        user_actions: userActions.map((action) => ({
          op: action.op,
          row_id: action.rowId,
          column: action.column || null,

          // 🚩【关键修改】将 'value' 改回 'after'，以匹配 Python Schema
          after: action.after !== undefined ? action.after : null,

          // (同时确保不要发送 'value' 字段)
        })),
        clean_rules: this._mapRulesToSnakeCase(session.cleanRules),
        meta: {
          quality_version: task.qualityVersion,
          cleaning_version: task.cleaningVersion,
        },
      };

      // 3. Call FastAPI Client
      const result = await fastApiClient.performCleaning(payload);

      logger.info(
        `✅ [Cleaning] FastAPI Computed. Duration: ${result.log?.[0] || "N/A"}`
      );

      // 4. Update Database (Parallel Operations)
      await Promise.all([
        // A. Save Report
        cleaningReportRepository.create({
          taskId: task.fileId, // 👈 补上这个 (Schema required: true)
          qualityVersion: task.qualityVersion, // 👈 补上这个 (Schema required: true)
          fileId: task.fileId,
          sessionId: task.sessionId,
          cleaningVersion: task.cleaningVersion,
          summary: result.summary,
          diffSummary: result.diff_summary,
          cleanedAsset: result.cleaned_asset_ref,
          logs: result.log, // Ensure schema supports Array or Mixed
        }),
        // B. Update Task Status
        cleaningTaskRepository.updateStatus(task.fileId, "success"),
        // C. Update File Status
        fileRepository.updateById(task.fileId.toString(), {
          stage: "cleaning_done",
          // cleanedPath: result.cleaned_asset_ref.path
        }),
      ]);
    } catch (error: any) {
      // 🔥 Construct Standardized CleaningError
      const isAxiosError = !!error.isAxiosError;
      const status = error.response?.status || 500;

      const cleaningError: ICleaningError = {
        stage: isAxiosError ? "fastapi" : "execution",
        code: isAxiosError ? `FASTAPI_${status}` : "INTERNAL_ERROR",
        message: error.message || "Cleaning execution failed",
        detail: error.response?.data || error.stack,
        retryable: status >= 500, // Only retry on server errors
        occurredAt: new Date(),
      };

      logger.error(`❌ [Cleaning] Task Failed: ${task.fileId}`, cleaningError);

      // Update Database on Failure (Sequential to ensure Task is updated first)
      try {
        await cleaningTaskRepository.updateStatus(task["fileId"], "failed", {
          errorMessage: cleaningError.message,
          errorDetail: cleaningError,
        });

        await fileRepository.updateById(task.fileId.toString(), {
          stage: "cleaning_failed",
          analysisError: {
            stage: "cleaning",
            code: cleaningError.code,
            message: cleaningError.message,
            occurredAt: cleaningError.occurredAt,
            details: {
              internalStage: cleaningError.stage,
              rawDetail: cleaningError.detail,
            },
          },
        });
      } catch (dbError) {
        logger.error(`❌ [Cleaning] Failed to update DB after error`, dbError);
      }

      // Re-throw for upper-level handling (e.g., specific HTTP response)
      throw error;
    }
  },
  /**
   * 🛠️ 辅助：规则对象映射 (CamelCase -> SnakeCase)
   */
  _mapRulesToSnakeCase(rules: any) {
    if (!rules) return {};
    return {
      missing: {
        enabled: rules.missing?.enabled ?? false,
        strategy: rules.missing?.strategy || "fill",
        fill_method: rules.missing?.fillMethod || "median", // Key Change
        apply_columns: rules.missing?.applyColumns || [], // Key Change
      },
      deduplicate: {
        enabled: rules.deduplicate?.enabled ?? false,
        subset: rules.deduplicate?.subset || null,
        keep: rules.deduplicate?.keep || "first",
      },
      outliers: {
        enabled: rules.outliers?.enabled ?? false,
        method: rules.outliers?.method || "iqr",
        threshold: rules.outliers?.threshold || 1.5,
      },
      type_cast: {
        enabled: rules.typeCast?.enabled ?? false,
        rules: (rules.typeCast?.rules || []).map((r: any) => ({
          column: r.column,
          target_type: r.targetType, // Key Change
          format: r.format || null,
        })),
      },
      filter: {
        enabled: rules.filter?.enabled ?? false,
      },
    };
  },
};
