import mongoose from "mongoose";
import { fileRepository } from "../../file/repository/file.repository";
import { cleaningSessionRepository } from "../repository/cleaningSession.repository";
import { cleaningTaskRepository } from "../repository/cleaningTask.repository";
import { cleaningReportRepository } from "../repository/cleaningReport.repository";
import { CleaningStatusResponseDTO } from "../dto/cleaningResponse.dto";
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception";

export const cleaningQueryService = {
  /**
   * 获取聚合状态
   */
  /**
   * 获取聚合状态（以 Task 为权威）
   */
  async getCleaningStatus(
    fileId: string,
    qualityVersion?: number,
  ): Promise<any /* CleaningStatusResponseDTO */> {
    const fId = new mongoose.Types.ObjectId(fileId);

    // 1) 默认 qualityVersion：不传就用 File.latestQualityVersion
    let qVer = qualityVersion;
    if (qVer === undefined) {
      const file = await fileRepository.findById(fileId);
      if (!file) throw new FileNotFoundException("File not found");
      qVer = file.latestQualityVersion || 0;
    }

    if (!qVer) {
      return {
        fileId,
        qualityVersion: 0,
        session: null,
        currentTask: null,
        latestTask: null,
        latestReport: null,
      };
    }

    // 2) 并行查：session + currentTask + latestTask
    const [activeSession, currentTask, latestTask] = await Promise.all([
      cleaningSessionRepository.findActiveByFileAndQuality(fId, qVer),
      cleaningTaskRepository.findCurrentTask(fId, qVer),
      cleaningTaskRepository.findLatestTask(fId, qVer),
    ]);

    // 3) latestReport：只跟随 latestTask(success)
    let latestReport = null;
    if (latestTask?.status === "success") {
      latestReport = await cleaningReportRepository.findByTaskId(
        latestTask._id as any,
      );
    }

    // 4) 返回（注意：startedAt 不要造 new Date()）
    return {
      fileId,
      qualityVersion: qVer,

      session: activeSession
        ? {
            sessionId: activeSession._id.toString(),
            status: activeSession.status, // draft/running/closed：只表示会话生命周期
          }
        : null,

      // ✅ currentTask：只代表正在跑的任务
      currentTask: currentTask
        ? {
            taskId: currentTask._id.toString(),
            status: currentTask.status,
            startedAt: currentTask.startedAt ?? null,
            errorMessage: currentTask.errorMessage ?? null,
          }
        : null,

      // ✅ latestTask：最新任务（成功/失败都可能）
      latestTask: latestTask
        ? {
            taskId: latestTask._id.toString(),
            status: latestTask.status,
            cleaningVersion: latestTask.cleaningVersion,
            createdAt: latestTask.createdAt,
            errorMessage: latestTask.errorMessage ?? null,
          }
        : null,

      // ✅ latestReport：仅在 latestTask.success 时出现
      latestReport: latestReport
        ? {
            reportId: latestReport._id.toString(),
            cleaningVersion: latestReport.cleaningVersion,
            createdAt: latestReport.createdAt,
            summary: latestReport.summary,
            hasAsset: !!latestReport.cleanedAsset?.path,
          }
        : null,
    };
  },

  /**
   * 获取历史版本列表
   */
  async listReports(fileId: string, qualityVersion: number) {
    const reports = await cleaningReportRepository.listByQualityVersion(
      new mongoose.Types.ObjectId(fileId),
      qualityVersion,
    );

    return {
      fileId,
      qualityVersion,
      reports: reports.map((r) => ({
        id: r._id, // 通常列表也需要 Report ID
        cleaningVersion: r.cleaningVersion,
        createdAt: r.createdAt,
        // 🚨 [修改] 移除了 metrics
        summary: r.summary,
        // 🚨 [新增] 可以在列表里简单展示是否生成了文件
        hasAsset: !!r.cleanedAsset?.path,
      })),
    };
  },

  /**
   * 获取版本详情
   */
  async getReportDetail(
    fileId: string,
    qualityVersion: number,
    cleaningVersion: number,
  ) {
    const report = await cleaningReportRepository.findByVersion(
      new mongoose.Types.ObjectId(fileId),
      qualityVersion,
      cleaningVersion,
    );

    if (!report) {
      throw new FileNotFoundException(
        `Cleaning Report v${cleaningVersion} not found`,
      );
    }

    return {
      fileId,
      qualityVersion,
      cleaningVersion: report.cleaningVersion,
      createdAt: report.createdAt,
      taskId: report.taskId, // 返回关联的 Task ID

      // ✅ [修改] 产物引用结构调整
      cleanedAsset: report.cleanedAsset, // { path: "...", preview: [] }

      // 为了兼容旧前端习惯，你也可以手动拆解（可选）：
      // cleanedFilePath: report.cleanedAsset?.path,

      // ✅ [修改] 移除了 metrics，直接返回 summary
      summary: report.summary,

      // ✅ [新增] 差异详情
      diffSummary: report.diffSummary,

      // ✅ [修改] 字段名 logs 对应 DB 中的 logs
      logs: report.logs,
    };
  },
};
