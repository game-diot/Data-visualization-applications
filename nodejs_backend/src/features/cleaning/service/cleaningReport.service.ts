import { cleaningReportRepository } from "../repository/cleaningReport.repository";
import { ICleaningTask } from "../models/interfaces/cleaningTask.interface";

export const cleaningReportService = {
  /**
   * 核心：将成功的 Task 结果固化为 Report
   * @param task 清洗任务对象
   * @param result FastAPI 返回的清洗结果
   */
  async createFromTask(task: ICleaningTask, result: any) {
    // ✅ FastAPI: summary / cleaned_asset_ref / diff_summary / log
    const s = result?.summary ?? null;
    const asset = result?.cleaned_asset_ref ?? null;
    const diff = result?.diff_summary ?? null;

    // ✅ FastAPI 新增字段
    const rulesAppliedDetail = result?.rules_applied_detail ?? [];
    const actionsReplay = result?.actions_replay ?? null;

    // ✅ taskId 必须是 cleaningTask 的 _id
    const taskId = (task as any)._id ?? (task as any).id;

    return cleaningReportRepository.create({
      fileId: task.fileId,
      sessionId: task.sessionId,
      taskId: taskId,

      qualityVersion: task.qualityVersion,
      cleaningVersion: task.cleaningVersion,

      // ✅ summary: snake_case -> camelCase（这是你 report 为空的关键修复）
      summary: s
        ? {
            rowsBefore: s.rows_before ?? 0,
            rowsAfter: s.rows_after ?? 0,
            columnsBefore: s.columns_before ?? 0,
            columnsAfter: s.columns_after ?? 0,

            rowsRemoved: s.rows_removed ?? 0,
            columnsRemoved: s.columns_removed ?? 0,
            cellsModified: s.cells_modified ?? 0,

            userActionsApplied: s.user_actions_applied ?? 0,
            rulesApplied: Array.isArray(s.rules_applied) ? s.rules_applied : [],

            missingRateBefore: s.missing_rate_before ?? null,
            missingRateAfter: s.missing_rate_after ?? null,
            duplicateRateBefore: s.duplicate_rate_before ?? null,
            duplicateRateAfter: s.duplicate_rate_after ?? null,

            // 如果你 FastAPI summary 加了 duration_ms 且 schema/interface 也加了
            durationMs: s.duration_ms ?? null,
          }
        : null,

      // ✅ diffSummary: snake_case -> camelCase
      diffSummary: diff
        ? {
            byRule: diff.by_rule ?? null,
            byColumn: diff.by_column ?? null,
          }
        : { byRule: null, byColumn: null },

      // ✅ cleanedAsset: snake_case -> camelCase（你 schema 已扩展）
      cleanedAsset: asset
        ? {
            type: asset.type ?? "local_file",
            path: asset.path ?? "",
            format: asset.format ?? "csv",
            sizeBytes: asset.size_bytes ?? null,
            preview: asset.preview ?? [],
          }
        : {
            type: "local_file",
            path: "",
            format: "csv",
            sizeBytes: null,
            preview: [],
          },

      // ✅ 新增字段落库
      rulesAppliedDetail: Array.isArray(rulesAppliedDetail)
        ? rulesAppliedDetail
        : [],
      actionsReplay: actionsReplay
        ? {
            total: actionsReplay.total ?? 0,
            applied: actionsReplay.applied ?? 0,
            failed: actionsReplay.failed ?? 0,
          }
        : { total: 0, applied: 0, failed: 0 },

      // ✅ logs 字段名：FastAPI 是 log
      logs: Array.isArray(result?.log) ? result.log : [],
    });
  },
};
