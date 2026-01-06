import { Request, Response, NextFunction } from "express";
import { fileService } from "../../file/services/file.service"; // ⭐️ 关键：允许 Controller 跨模块调用 Service
import { responseUtils } from "../../../shared/utils/response.util";
import { ValidationException } from "../../../shared/exceptions/validation.exception";
import { qualityService } from "../services/quality.services";
import { FileStage } from "features/file/constant/file-stage.constant";
import { QualitySummaryResponseDTO } from "../dto/qualitySummary.dto";

export const qualityController = {
  /**
   * 获取质量分析结果
   * GET /api/v1/quality/:id
   */
  async getAnalysisResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // 1. 先校验文件是否存在 (调用 FileService)
      // 这比直接查 QualityReport 更安全，防止查到已删除文件的残留报告
      await fileService.getFileById(id);

      // 2. 获取结果
      const result = await qualityService.getLatestResult(id);

      if (!result) {
        // 可能文件存在但还没分析完
        return responseUtils.success(res, null, "分析结果尚未生成或分析中");
      }

      return responseUtils.success(res, result, "获取分析结果成功");
    } catch (error) {
      next(error);
    }
  },
  /**
   * ✅ [新增] 获取质量分析摘要
   * 目标：轻量级、快速、无需查询 QualityReport 大表
   * 路由：GET /api/v1/quality/:id/summary
   */
  async getAnalysisSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 1. 跨模块调用 FileService (只查 File 表)
      const file = await fileService.getFileById(id);

      // 2. 状态校验 (只有分析完成的文件才有摘要)
      if (file.stage !== "quality_done") {
        return responseUtils.fail(
          res,
          `无法获取摘要，当前状态为: ${file.stage}`,
          400
        );
      }

      // 3. 组装 DTO (从 FileModel 的扁平字段提取)
      const summary: QualitySummaryResponseDTO = {
        fileId: file._id.toString(),
        // 这里的字段必须对应 FileModel 新增的字段，如果为空则给默认值 0
        latestVersion: file.latestQualityVersion || 0,
        qualityScore: file.qualityScore || 0,
        missingRate: file.missingRate || 0,
        duplicateRate: file.duplicateRate || 0,
        totalRows: file.totalRows || 0,
        totalColumns: file.totalColumns || 0,
        analyzedAt: file.analysisCompletedAt || file.updatedAt,
      };

      return responseUtils.success(res, summary, "获取质量摘要成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取指定 version 的分析结果
   */
  async getAnalysisResultByVersion(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id, version } = req.params;

      const result = await qualityService.getResultByVersion(
        id,
        Number(version)
      );

      if (!result) {
        return responseUtils.fail(res, "指定版本不存在", 404);
      }
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * ⭐️ 修复：手动触发/重试分析
   * 逻辑：Controller 负责从 FileService 拿路径，传给 QualityService
   */
  async triggerAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { forceRefresh } = req.body;

      // 1. 跨模块获取文件信息 (获取 filePath)
      const file = await fileService.getFileById(id);

      // 2. 校验状态 (可选：如果正在分析中，是否允许重试？)
      // if (file.stage === 'quality_analyzing') ...

      // 3. 调用 QualityService (传入 path 和 forceRefresh)
      // 这里复用了 performAnalysis，并没有单独写 retryAnalysis，减少重复逻辑
      await qualityService.performAnalysis(id, file.path, forceRefresh ?? true);

      return responseUtils.success(res, null, "分析任务已重新提交");
    } catch (error) {
      next(error);
    }
  },

  /**
   * ⭐️ 修复：获取质量分析状态
   * 逻辑：状态是 File 的属性，应该问 FileService 要，然后在这里通过 Helper 转换格式
   */
  async getAnalysisStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 1. 调用 FileService 获取文件最新状态
      const file = await fileService.getFileById(id);

      // 2. 转换为前端需要的 status 格式 (逻辑内聚在 Controller 或 Utils)
      const status = mapFileStageToQualityStatus(file);

      return responseUtils.success(res, status, "获取分析状态成功");
    } catch (error) {
      next(error);
    }
  },
};

// ==========================================
// Helper: 状态映射函数 (放在 Controller 底部或 Utils 中)
// ==========================================
function mapFileStageToQualityStatus(file: any) {
  const stage = file.stage as FileStage;
  const base = {
    updatedAt: file.updatedAt,
    hasResult: false,
    stage: stage,
    message: "",
  };

  switch (stage) {
    case "uploaded":
      return { ...base, message: "等待开始分析" };
    case "quality_pending":
      return { ...base, message: "任务排队中" };
    case "quality_analyzing":
      return { ...base, message: "正在进行质量检测..." };
    case "quality_done":
      return {
        ...base,
        hasResult: true,
        message: "分析完成",
        updatedAt: file.analysisCompletedAt,
      };
    case "quality_failed":
      return {
        ...base,
        message: file.errorMessage || "分析失败",
        stage: "quality_failed",
      };
    default:
      return { ...base, message: "未知状态" };
  }
}
