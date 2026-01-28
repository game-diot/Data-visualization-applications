import mongoose from "mongoose";
import { analysisTaskRepository } from "../repository/analysisTask.repository";
import { analysisReportRepository } from "../repository/analysisReport.repository";
import { analysisRunnerService } from "./analysisRunner.service";
import { fileRepository } from "../../file/repository/file.repository"; // 路径按你项目调整
import { cleaningReportRepository } from "../../cleaning/repository/cleaningReport.repository"; // 用于取 cleanedAsset

import { validateAnalysisConfigOrThrow } from "../utils/validateAnalysisConfig.util"; // 你后续补

// 可选：用 catalog 的列画像做 validate（若你已接入）
import type { ColumnProfileDTO } from "../dto/columnProfile.dto";
import { qualityReportRepository } from "../../quality/repository/qualityReport.repository"; // 用 types 推断列 dtype
import { mapPandasDTypeToColumnDType } from "../utils/columnTypeMapper.util";

import { BadRequestException } from "@shared/exceptions/badRequest.exception";
import { FileNotFoundException } from "@shared/exceptions/fileNotFound.exception";
import { AnalysisRunRequestDTO } from "../dto/analysisRunRequest.dto";
import { validateSelectionOrThrow } from "../utils/validateSelection.util";
import { logger } from "@shared/utils/logger.util";

export const analysisTaskService = {
  /**
   * 🟢 对外入口：触发分析
   * - 创建 task（pending）
   * - 计算 analysisVersion（从 report max+1，成功才占号）
   * - 异步 fire-and-forget 执行
   */
  async triggerAnalysis(fileId: string, req: AnalysisRunRequestDTO) {
    const fId = new mongoose.Types.ObjectId(fileId);

    // 0) File 必须存在
    const file = await fileRepository.findById(fileId);
    if (!file) throw new FileNotFoundException("File not found");

    // 1) 质量版本必须明确（不传就用 latestQualityVersion）
    const qualityVersion = req.qualityVersion ?? file.latestQualityVersion;
    if (!qualityVersion)
      throw new BadRequestException("qualityVersion is required");

    // 2) input 默认 cleaned
    const inputMode = req.input ?? "cleaned";

    // 3) cleaningVersion 规则：cleaned 模式必须提供（或你可以默认用最新成功 cleaningVersion）
    // MVP 建议：必须显式传 cleaningVersion，避免歧义
    const cleaningVersion =
      inputMode === "raw" ? 0 : (req.cleaningVersion ?? 0);
    if (inputMode !== "raw" && !cleaningVersion) {
      throw new BadRequestException(
        "cleaningVersion is required when input=cleaned",
      );
    }

    // 4) selection 校验（end 不包含、columns null=全列、[]非法）
    if (req.dataSelection) {
      validateSelectionOrThrow(req.dataSelection);
      // MVP：filters/sample 若存在直接拒绝（避免误解）
      if (req.dataSelection.filters || req.dataSelection.sample) {
        throw new BadRequestException("filters/sample not supported in MVP");
      }
    }

    // 5) 取列 dtype（用于 Node validate stage）
    // 依赖 qualityReport.snapshot.types（你已实现）
    const qReport = await qualityReportRepository.findByFileIdAndVersion(
      fileId,
      qualityVersion,
    );
    if (!qReport)
      throw new BadRequestException(
        `QualityReport not found for version=${qualityVersion}`,
      );

    const types: Record<string, string> = qReport.snapshot?.types || {};
    const columnsProfile: ColumnProfileDTO[] = Object.entries(types).map(
      ([name, pandasType]) => ({
        name,
        dtype: mapPandasDTypeToColumnDType(pandasType),
      }),
    );

    const selectedColumns =
      req.dataSelection?.columns == null ? null : req.dataSelection.columns;

    // 6) analysisConfig 校验（依赖 dtype + 选列）
    validateAnalysisConfigOrThrow(
      columnsProfile,
      selectedColumns,
      req.analysisConfig,
    );

    // 7) Resolve dataRef（默认用 cleanedAsset.path）
    const dataRef = await resolveDataRefOrThrow({
      fileId,
      qualityVersion,
      cleaningVersion,
      inputMode,
    });

    // 8) 计算下一个 analysisVersion（从 report max+1）
    const nextAnalysisVersion =
      await analysisReportRepository.getNextAnalysisVersion(
        fId,
        qualityVersion,
        cleaningVersion,
      );

    // 9) 创建 Task（pending/received）
    const task = await analysisTaskRepository.create({
      fileId: fId,
      qualityVersion,
      cleaningVersion,
      analysisVersion: nextAnalysisVersion,

      dataRef,
      dataSelection: req.dataSelection ?? null,
      analysisConfig: req.analysisConfig,

      status: "pending",
      stage: "received",
      startedAt: null,
      finishedAt: null,
      error: null,
    } as any);

    // 10) 更新 File 粗粒度 stage（analysis_pending）
    await fileRepository.updateById(fileId, { stage: "analysis_pending" });

    // 11) 异步执行（不 await）
    analysisRunnerService.executeTask(task).catch((err) => {
      logger.error(
        `❌ [Analysis] Async execution failed for task ${task.fileId}`,
        err,
      );
    });

    return task;
  },
};

/**
 * 根据 inputMode 解析 dataRef
 * - cleaned：从 cleaningReport.cleanedAsset 获取 path/format/type
 * - raw：用 file.path
 */
async function resolveDataRefOrThrow(args: {
  fileId: string;
  qualityVersion: number;
  cleaningVersion: number;
  inputMode: "cleaned" | "raw";
}) {
  const { fileId, qualityVersion, cleaningVersion, inputMode } = args;

  if (inputMode === "raw") {
    const file = await fileRepository.findById(fileId);
    if (!file) throw new FileNotFoundException("File not found");
    if (!file.path) throw new BadRequestException("File path is missing");
    return {
      type: "local_file",
      path: file.path,
      format: "csv",
      encoding: "utf-8",
      delimiter: null,
      sheetName: null,
    };
  }

  // cleaned：依赖 cleaningReport
  const report = await cleaningReportRepository.findByVersion(
    new mongoose.Types.ObjectId(fileId),
    qualityVersion,
    cleaningVersion,
  );
  if (!report?.cleanedAsset?.path) {
    throw new BadRequestException(
      "Cleaned asset not found for specified cleaningVersion",
    );
  }

  return {
    type: report.cleanedAsset.type ?? "local_file",
    path: report.cleanedAsset.path,
    format: report.cleanedAsset.format ?? "csv",
    encoding: "utf-8",
    delimiter: null,
    sheetName: null,
  };
}
