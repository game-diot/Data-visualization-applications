import { cleaningReportRepository } from "../repository/cleaningReport.repository";
import { ICleaningTask } from "../models/interfaces/cleaningTask.interface";

export const cleaningReportService = {
  /**
   * 核心：将成功的 Task 结果固化为 Report
   * @param task 清洗任务对象
   * @param result FastAPI 返回的清洗结果
   */
  async createFromTask(task: ICleaningTask, result: any) {
    // 1. 提取 metrics，防止 result.metrics 为空导致 crash
    const m = result.metrics || {};

    // 2. 提取 asset，防止 result.cleaned_asset_ref 为空
    const asset = result.cleaned_asset_ref || {};

    return cleaningReportRepository.create({
      // --- ID 映射 ---
      fileId: task.fileId,
      sessionId: task.sessionId,
      // 必须使用任务的 _id (MongoDB ObjectId)
      taskId: task.taskId,

      // --- 版本控制 (继承 Task) ---
      qualityVersion: task.qualityVersion,
      cleaningVersion: task.cleaningVersion,

      // --- 📊 核心统计 Summary ---
      // 严格按照 ICleaningSummary 接口字段进行映射
      // 假设 FastAPI 返回的是下划线格式 (snake_case)，映射到 Schema 的驼峰 (camelCase)
      summary: {
        rowsBefore: m.rows_before ?? 0,
        rowsAfter: m.rows_after ?? 0,
        columnsBefore: m.columns_before ?? 0,
        columnsAfter: m.columns_after ?? 0,

        rowsRemoved: m.rows_removed ?? 0,
        columnsRemoved: m.columns_removed ?? 0,
        cellsModified: m.cells_modified ?? 0,

        userActionsApplied: m.user_actions_applied ?? 0,
        // 确保是字符串数组
        rulesApplied: Array.isArray(m.rules_applied) ? m.rules_applied : [],

        missingRateBefore: m.missing_rate_before ?? 0,
        missingRateAfter: m.missing_rate_after ?? 0,
        duplicateRateBefore: m.duplicate_rate_before ?? 0,
        duplicateRateAfter: m.duplicate_rate_after ?? 0,
      },

      // --- 🔍 差异详情 ---
      diffSummary: result.diff_summary || {},

      // --- 📦 产物引用 ---
      // 对应 Interface: { path: string; preview?: any[] }
      cleanedAsset: {
        path: asset.path || "", // 确保有值
        preview: asset.preview || [], // 可选，确保是数组
      },

      // --- 📝 执行日志 ---
      // 对应 Interface: string[] (不能为 null)
      logs: result.detail_log || [],

      // createdAt 由 Mongoose timestamp 自动处理，无需手动传
    });
  },
};
