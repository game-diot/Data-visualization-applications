import mongoose from "mongoose";
import { analysisTaskRepository } from "../repository/analysisTask.repository";
import { analysisReportRepository } from "../repository/analysisReport.repository";
import { fileRepository } from "../../file/repository/file.repository"; // 按你项目路径调整

import type { AnalysisStatusResponseDTO } from "../dto/analysisStatusResponse.dto";
import type { AnalysisTaskSummaryDTO } from "../dto/analysisTaskSummary.dto";
import type { AnalysisReportSummaryDTO } from "../dto/analysisReportSummary.dto";
import type { AnalysisReportDTO } from "../dto/analysisReport.dto";
import { BadRequestException } from "@shared/exceptions/badRequest.exception";
import { FileNotFoundException } from "@shared/exceptions/fileNotFound.exception";

function toISO(d?: Date | null) {
  return d ? d.toISOString() : null;
}

function mapTaskToSummary(task: any): AnalysisTaskSummaryDTO {
  return {
    taskId: String(task._id),
    status: task.status,
    stage: task.stage,
    analysisVersion: task.analysisVersion,
    startedAt: toISO(task.startedAt),
    finishedAt: toISO(task.finishedAt),
    errorMessage: task.error?.message ?? task.errorMessage ?? null,
  };
}

function mapReportToSummary(report: any): AnalysisReportSummaryDTO {
  return {
    reportId: String(report._id),
    analysisVersion: report.analysisVersion,
    createdAt: report.createdAt
      ? new Date(report.createdAt).toISOString()
      : new Date().toISOString(),
    summary: report.summary ?? undefined,
    hasArtifacts:
      Array.isArray(report.artifacts) && report.artifacts.length > 0,
  };
}

export const analysisQueryService = {
  /**
   * 聚合状态：currentTask/latestTask/latestReport
   * GET /api/v1/analysis/:fileId/status?qualityVersion=&cleaningVersion=
   */
  async getStatus(
    fileId: string,
    qualityVersion?: number,
    cleaningVersion?: number,
  ): Promise<AnalysisStatusResponseDTO> {
    const fId = new mongoose.Types.ObjectId(fileId);

    // qualityVersion 默认取 File.latestQualityVersion
    let qVer = qualityVersion;
    if (qVer === undefined) {
      const file = await fileRepository.findById(fileId);
      if (!file) throw new FileNotFoundException("File not found");
      qVer = file.latestQualityVersion || 0;
    }
    if (!qVer) throw new BadRequestException("qualityVersion is required");

    // cleaningVersion 建议必传（默认分析用 cleaned 版本）
    if (cleaningVersion === undefined || cleaningVersion === null) {
      throw new BadRequestException("cleaningVersion is required");
    }
    const cVer = Number(cleaningVersion);
    if (!Number.isInteger(cVer) || cVer < 0) {
      throw new BadRequestException(
        "cleaningVersion must be a non-negative integer",
      );
    }

    // 并行查 current/latest task
    const [currentTaskDoc, latestTaskDoc] = await Promise.all([
      analysisTaskRepository.findCurrentTask(fId, qVer, cVer),
      analysisTaskRepository.findLatestTask(fId, qVer, cVer),
    ]);

    // latestReport 只跟随 latestTask.success
    let latestReportDoc: any = null;
    if (latestTaskDoc?.status === "success") {
      latestReportDoc = await analysisReportRepository.findByTaskId(
        latestTaskDoc._id,
      );
    }

    return {
      fileId,
      qualityVersion: qVer,
      cleaningVersion: cVer,
      currentTask: currentTaskDoc ? mapTaskToSummary(currentTaskDoc) : null,
      latestTask: latestTaskDoc ? mapTaskToSummary(latestTaskDoc) : null,
      latestReport: latestReportDoc
        ? mapReportToSummary(latestReportDoc)
        : null,
    };
  },

  /**
   * 报告列表（摘要层）
   * GET /api/v1/analysis/:fileId/reports?qualityVersion=&cleaningVersion=
   */
  async listReports(
    fileId: string,
    qualityVersion?: number,
    cleaningVersion?: number,
  ) {
    const fId = new mongoose.Types.ObjectId(fileId);

    // qualityVersion 默认取 File.latestQualityVersion
    let qVer = qualityVersion;
    if (qVer === undefined) {
      const file = await fileRepository.findById(fileId);
      if (!file) throw new FileNotFoundException("File not found");
      qVer = file.latestQualityVersion || 0;
    }
    if (!qVer) throw new BadRequestException("qualityVersion is required");

    if (cleaningVersion === undefined || cleaningVersion === null) {
      throw new BadRequestException("cleaningVersion is required");
    }
    const cVer = Number(cleaningVersion);
    if (!Number.isInteger(cVer) || cVer < 0) {
      throw new BadRequestException(
        "cleaningVersion must be a non-negative integer",
      );
    }

    const reports = await analysisReportRepository.listByInputVersion(
      fId,
      qVer,
      cVer,
    );

    return {
      fileId,
      qualityVersion: qVer,
      cleaningVersion: cVer,
      reports: reports.map(mapReportToSummary),
    };
  },

  /**
   * 报告详情（detail 层：summary+charts+logs+modelResult+artifacts）
   * GET /api/v1/analysis/:fileId/reports/:version?qualityVersion=&cleaningVersion=
   */
  async getReportDetail(
    fileId: string,
    analysisVersion: number,
    qualityVersion?: number,
    cleaningVersion?: number,
  ): Promise<AnalysisReportDTO> {
    const fId = new mongoose.Types.ObjectId(fileId);

    // qualityVersion 默认取 File.latestQualityVersion
    let qVer = qualityVersion;
    if (qVer === undefined) {
      const file = await fileRepository.findById(fileId);
      if (!file) throw new FileNotFoundException("File not found");
      qVer = file.latestQualityVersion || 0;
    }
    if (!qVer) throw new BadRequestException("qualityVersion is required");

    if (cleaningVersion === undefined || cleaningVersion === null) {
      throw new BadRequestException("cleaningVersion is required");
    }
    const cVer = Number(cleaningVersion);
    if (!Number.isInteger(cVer) || cVer < 0) {
      throw new BadRequestException(
        "cleaningVersion must be a non-negative integer",
      );
    }

    const aVer = Number(analysisVersion);
    if (!Number.isInteger(aVer) || aVer <= 0) {
      throw new BadRequestException(
        "analysisVersion must be a positive integer",
      );
    }

    const report = await analysisReportRepository.findByVersion(
      fId,
      qVer,
      cVer,
      aVer,
    );
    if (!report) {
      throw new BadRequestException(
        `AnalysisReport not found (analysisVersion=${aVer})`,
      );
    }

    return {
      fileId,
      qualityVersion: qVer,
      cleaningVersion: cVer,
      analysisVersion: report.analysisVersion,
      taskId: String(report.taskId),

      summary: report.summary ?? {},
      charts: Array.isArray(report.charts) ? report.charts : [],
      modelResult: report.modelResult ?? null,
      artifacts: Array.isArray(report.artifacts) ? report.artifacts : [],
      logs: Array.isArray(report.logs) ? report.logs : [],
      createdAt: report.createdAt
        ? new Date(report.createdAt).toISOString()
        : new Date().toISOString(),
    };
  },
};
