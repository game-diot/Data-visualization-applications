import { analysisReportRepository } from "../repository/analysisReport.repository";

/**
 * FastAPI -> Node 落库映射集中在这里，避免“空字段”重演
 */
export const analysisReportService = {
  async createFromTask(task: any, result: any) {
    const taskId = task._id;

    // FastAPI fields (snake_case)
    const summary = result.summary ?? {};
    const charts = Array.isArray(result.charts) ? result.charts : [];
    const modelResult = result.model_result ?? null;
    const artifacts = Array.isArray(result.artifacts) ? result.artifacts : [];
    const logs = Array.isArray(result.log) ? result.log : [];

    // Node store (camelCase)
    return analysisReportRepository.create({
      taskId,
      fileId: task.fileId,
      qualityVersion: task.qualityVersion,
      cleaningVersion: task.cleaningVersion,
      analysisVersion: task.analysisVersion,

      summary, // MVP：Mixed，先不做深映射
      charts, // chart-ready payload
      modelResult,
      artifacts,
      logs,
    } as any);
  },
};
