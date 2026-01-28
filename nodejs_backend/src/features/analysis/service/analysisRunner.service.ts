import { analysisTaskRepository } from "../repository/analysisTask.repository";
import { fileRepository } from "../../file/repository/file.repository";

import { analysisReportService } from "./analysisReport.service";

import { fastApiClient } from "api/fastapi/clients/fastapiClient";
import { logger } from "@shared/utils/logger.util";

export const analysisRunnerService = {
  /**
   * 🔥 真正执行（异步）
   * - running + startedAt
   * - call FastAPI
   * - success: create report + update task + file stage done
   * - failed: update task error + file stage failed (no report)
   */
  async executeTask(task: any /* lean or doc */) {
    const taskId = task._id;

    // 1) mark running
    await Promise.all([
      analysisTaskRepository.updateStatus(taskId, "running", {
        startedAt: new Date(),
      }),
      analysisTaskRepository.updateStage(taskId, "load"),
      fileRepository.updateById(task.fileId.toString(), {
        stage: "analysis_processing",
      }),
    ]);

    try {
      // 2) build FastAPI payload (snake_case)
      const payload = {
        file_id: task.fileId.toString(),
        data_ref: toSnakeDataRef(task.dataRef),
        data_selection: toSnakeSelection(task.dataSelection),
        analysis_config: toSnakeConfig(task.analysisConfig),
        meta: {
          quality_version: task.qualityVersion,
          cleaning_version: task.cleaningVersion,
          analysis_version: task.analysisVersion,
        },
      };

      logger.info(
        `🚀 [Analysis] FastAPI Req: POST /api/v1/analysis/run task=${taskId}`,
      );

      // 3) call FastAPI
      const result = await fastApiClient.performAnalysis(payload);

      // 4) stage from FastAPI (single source)
      const stageFromApi = result?.stage ?? "done";
      await analysisTaskRepository.updateStage(taskId, stageFromApi);

      if (result?.status !== "success") {
        // treat as failure
        throw buildFastapiError(result);
      }

      // 5) create report（集中映射在 analysisReportService）
      await analysisReportService.createFromTask(task, result);

      // 6) mark success
      await Promise.all([
        analysisTaskRepository.updateStatus(taskId, "success", {
          stage: "done",
          finishedAt: new Date(),
          error: null,
        }),
        fileRepository.updateById(task.fileId.toString(), {
          stage: "analysis_done",
        }),
      ]);

      logger.info(`✅ [Analysis] Task success task=${taskId}`);
    } catch (error: any) {
      const analysisError = normalizeError(error);

      logger.error(`❌ [Analysis] Task failed task=${taskId}`, analysisError);

      await Promise.all([
        analysisTaskRepository.updateStatus(taskId, "failed", {
          finishedAt: new Date(),
          error: analysisError,
          stage: analysisError.stage ?? "unknown",
        }),
        fileRepository.updateById(task.fileId.toString(), {
          stage: "analysis_failed",
          analysisError: {
            stage: "analysis",
            code: analysisError.code,
            message: analysisError.message,
            occurredAt: analysisError.occurredAt,
            details: analysisError.detail,
          },
        }),
      ]);

      // ✅ 失败不产出 report：这里不要写 report
    }
  },
};

function toSnakeDataRef(dataRef: any) {
  if (!dataRef) return null;
  return {
    type: dataRef.type,
    path: dataRef.path,
    format: dataRef.format ?? "csv",
    encoding: dataRef.encoding ?? "utf-8",
    delimiter: dataRef.delimiter ?? null,
    sheet_name: dataRef.sheetName ?? null,
  };
}

function toSnakeSelection(sel: any) {
  if (!sel) return null;
  return {
    rows: sel.rows ? { start: sel.rows.start, end: sel.rows.end } : null,
    columns: sel.columns ?? null,
    // MVP: filters/sample 先不传（如果你允许传就映射）
  };
}

function toSnakeConfig(cfg: any) {
  return {
    type: cfg.type,
    columns: cfg.columns,
    target: cfg.target ?? null,
    group_by: cfg.groupBy ?? null,
    options: cfg.options ?? {},
  };
}

function buildFastapiError(result: any) {
  const e: any = new Error(result?.error?.message || "FastAPI analysis failed");
  e.isFastapiPayloadError = true;
  e.fastapi = result;
  return e;
}

function normalizeError(error: any) {
  // axios error
  const isAxiosError = !!error.isAxiosError;
  const status = error.response?.status || 500;

  if (error?.isFastapiPayloadError) {
    const fe = error.fastapi?.error;
    return {
      stage: fe?.stage || "unknown",
      code: fe?.code || "FASTAPI_FAILED",
      message: fe?.message || "FastAPI analysis failed",
      detail: fe?.detail ?? error.fastapi,
      retryable: true,
      occurredAt: new Date(),
    };
  }

  return {
    stage: isAxiosError ? "process" : "unknown",
    code: isAxiosError ? `FASTAPI_${status}` : "INTERNAL_ERROR",
    message: error.message || "Analysis execution failed",
    detail: error.response?.data || error.stack,
    retryable: status >= 500,
    occurredAt: new Date(),
  };
}
