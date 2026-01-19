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
  async getCleaningStatus(
    fileId: string,
    qualityVersion?: number
  ): Promise<CleaningStatusResponseDTO> {
    const fId = new mongoose.Types.ObjectId(fileId);

    // 1. 智能默认值：如果未传 qualityVersion，查 File 表获取最新
    let qVer = qualityVersion;
    if (qVer === undefined) {
      const file = await fileRepository.findById(fileId);
      if (!file) throw new FileNotFoundException("File not found");
      qVer = file.latestQualityVersion || 0;
    }

    if (qVer === 0) {
      return {
        fileId,
        qualityVersion: 0,
        session: null,
        currentTask: null,
        latestTask: null,
      };
    }

    // 2. 并行查询
    const [activeSession, latestReport] = await Promise.all([
      cleaningSessionRepository.findActiveByFileAndQuality(fId, qVer),
      cleaningReportRepository.findLatest(fId, qVer),
    ]);

    // 3. 查 Task (依赖 Session)
    let currentTask = null;
    if (activeSession) {
      const task = await cleaningTaskRepository.findLatestBySession(
        activeSession._id
      );
      if (task) {
        currentTask = {
          taskId: task._id.toString(), // 确保使用 _id
          status: task.status,
          startedAt: task.startedAt ?? new Date(),
          errorMessage: task.errorMessage,
        };
      }
    }

    // 4. 组装响应
    return {
      fileId,
      qualityVersion: qVer,

      session: activeSession
        ? {
            sessionId: activeSession._id.toString(),
            status: activeSession.status,
          }
        : null,

      currentTask,

      latestTask: latestReport
        ? {
            cleaningVersion: latestReport.cleaningVersion,
            createdAt: latestReport.createdAt,
            // 🚨 [修改] 移除了 metrics，直接返回 summary 对象
            // summary 内部包含了 rowsBefore, rowsAfter 等统计信息
            summary: latestReport.summary,
            // 如果前端只需要简要信息，可以在这里只提取 latestReport.summary.description
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
      qualityVersion
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
    cleaningVersion: number
  ) {
    const report = await cleaningReportRepository.findByVersion(
      new mongoose.Types.ObjectId(fileId),
      qualityVersion,
      cleaningVersion
    );

    if (!report) {
      throw new FileNotFoundException(
        `Cleaning Report v${cleaningVersion} not found`
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
