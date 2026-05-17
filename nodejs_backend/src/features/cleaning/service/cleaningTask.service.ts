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
    cleanRules: any, // 虽然通常规则在 Session 里，但也允许覆盖或传递
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
    const cleaningVersion =
      await cleaningTaskRepository.getNextCleaningVersion(fId);

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
    this._executeCleaningTask(task, actionsPayload, cleanRules).catch((err) =>
      logger.error(
        `❌ [Cleaning] Async execution failed for task ${task.fileId}`,
        err,
      ),
    );

    return task;
  },

  /**
   * 🟡 内部执行逻辑 (增强错误处理)
   */
  async _executeCleaningTask(
    task: ICleaningTask,
    userActions: any[],
    cleanRulesOverride?: any,
  ) {
    // ✅ 统一取 task 的主键（Mongoose 默认 _id）
    const taskId =
      (task as any)._id ?? (task as any).id ?? (task as any).taskId;

    try {
      logger.info(
        `🚀 [Cleaning] Start execution for Task ${taskId} (session=${task.sessionId})`,
      );

      // ✅ 进入即标记 running（异步任务语义必须有）
      // 这里用 taskId 更新，而不是 fileId
      await Promise.all([
        cleaningTaskRepository.updateStatus(taskId, "success", {
          finishedAt: new Date(),
        }),

        fileRepository.updateById(task.fileId.toString(), {
          stage: "cleaning_processing",
        }),
      ]);

      // 1. Prepare Prerequisites (File & Session)
      const [file, session] = await Promise.all([
        fileRepository.findById(String(task.fileId)),
        cleaningSessionRepository.findActiveById(task.sessionId),
      ]);

      if (!file) throw new Error(`File not found: ${task.fileId}`);
      if (!session)
        throw new Error(`Active session not found: ${task.sessionId}`);

      const effectiveRules = cleanRulesOverride ?? (session as any).cleanRules;

      // 2. Construct FastAPI Payload (CamelCase -> SnakeCase)
      const payload = {
        file_id: task.fileId.toString(),
        data_ref: {
          path: file.path, // file.path 已经是绝对路径
          type: "local_file",
        },
        user_actions: userActions.map((action) => ({
          op: action.op,
          row_id: action.rowId,
          column: action.column ?? null,
          // before 可选：如果你希望审计更完整，可以透传
          before: action.before ?? null,
          after: action.after !== undefined ? action.after : null,
        })),
        clean_rules: this._mapRulesToSnakeCase(effectiveRules),
        meta: {
          quality_version: task.qualityVersion,
          cleaning_version: task.cleaningVersion,
        },
      };

      logger.info(
        `[Cleaning] Effective rules: missing=${!!effectiveRules?.missing?.enabled}, ` +
          `dedup.keep=${effectiveRules?.deduplicate?.keep}, ` +
          `dedup.subset=${effectiveRules?.deduplicate?.subset?.length ?? "null"}, ` +
          `typeCast.enabled=${!!effectiveRules?.typeCast?.enabled}, ` +
          `typeCast.rules=${effectiveRules?.typeCast?.rules?.length ?? 0}`,
      );

      // 3. Call FastAPI Client
      const result = await fastApiClient.performCleaning(payload);

      logger.info(
        `✅ [Cleaning] FastAPI Computed. Duration: ${result.log?.[0] || "N/A"}`,
      );

      // ✅ 成功：写 report + 更新 task + 更新 file stage
      await Promise.all([
        cleaningReportService.createFromTask(task, result),

        // ✅ 状态更新必须按 taskId（不是 fileId）
        cleaningTaskRepository.updateStatus(taskId, "success", {
          finishedAt: new Date(),
        }),

        fileRepository.updateById(task.fileId.toString(), {
          stage: "cleaning_done",
        }),
        // ✅ 新增：标记 modifications 已消费
        userModificationRepository.markConsumedBySession(
          task.sessionId,
          taskId,
        ),
      ]);

      return result;
    } catch (error: any) {
      const isAxiosError = !!error.isAxiosError;
      const status = error.response?.status || 500;

      const cleaningError: ICleaningError = {
        stage: isAxiosError ? "fastapi" : "execution",
        code: isAxiosError ? `FASTAPI_${status}` : "INTERNAL_ERROR",
        message: error.message || "Cleaning execution failed",
        detail: error.response?.data || error.stack,
        retryable: status >= 500,
        occurredAt: new Date(),
      };

      logger.error(`❌ [Cleaning] Task Failed: ${taskId}`, cleaningError);

      // ✅ 失败：更新 task/file（按 taskId，不要按 fileId）
      try {
        await cleaningTaskRepository.updateStatus(taskId, "failed", {
          errorMessage: cleaningError.message,
          errorDetail: cleaningError,
          finishedAt: new Date(),
        });

        await Promise.all([
          fileRepository.updateById(task.fileId.toString(), {
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
          }),
        ]);
      } catch (dbError) {
        logger.error(`❌ [Cleaning] Failed to update DB after error`, dbError);
      }

      throw error;
    }
  },

  /**
   * 🛠️ 辅助：规则对象映射 (CamelCase -> SnakeCase)
   * 关键点：
   * - 用 ?? 代替 ||，避免吞掉 false/0/""
   * - Optional[List]：默认用 null（表示“自动/全量”），不要默认 []
   */
  _mapRulesToSnakeCase(rules: any) {
    if (!rules) return {};

    return {
      missing: {
        enabled: rules.missing?.enabled ?? false,
        strategy: rules.missing?.strategy ?? "fill",
        fill_method: rules.missing?.fillMethod ?? "median",
        // FastAPI 里 apply_columns: Optional[List[str]]，null 更符合“自动应用”
        apply_columns: rules.missing?.applyColumns ?? null,
        // 如果你支持 constant_value，也建议透传
        constant_value: rules.missing?.constantValue ?? null,
      },

      deduplicate: {
        enabled: rules.deduplicate?.enabled ?? false,
        // FastAPI subset: Optional[List[str]]，null 表示 ALL
        subset: rules.deduplicate?.subset ?? null,
        // keep 允许 false，必须用 ??，不能用 ||
        keep: rules.deduplicate?.keep ?? "first",
      },

      outliers: {
        enabled: rules.outliers?.enabled ?? false,
        method: rules.outliers?.method ?? "iqr",
        threshold: rules.outliers?.threshold ?? 1.5,
        // 你 FastAPI OutlierRule 有 apply_columns，这里也可以透传
        apply_columns: rules.outliers?.applyColumns ?? null,
      },

      type_cast: {
        enabled: rules.typeCast?.enabled ?? false,
        rules: (rules.typeCast?.rules ?? []).map((r: any) => ({
          column: r.column,
          target_type: r.targetType,
          format: r.format ?? null,
        })),
      },

      filter: {
        enabled: rules.filter?.enabled ?? false,
        drop_columns: rules.filter?.dropColumns ?? null,
        drop_rows_where: rules.filter?.dropRowsWhere ?? null,
      },
    };
  },
};
