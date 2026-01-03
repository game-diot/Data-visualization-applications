import { Request, Response, NextFunction } from "express";
import { qualityService } from "../services/quality.services";
import { responseUtils } from "../../../shared/utils/response.util"; // 使用重构后的工具
import { ValidationException } from "../../../shared/exceptions/validation.exception";

export const qualityController = {
  /**
   * 获取质量分析结果
   * GET /api/v1/quality/:id
   */
  async getAnalysisResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationException({
          field: "id",
          message: "File ID is required",
        });
      }

      const result = await qualityService.getQualityResult(id);

      return responseUtils.success(res, result, "获取分析结果成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 手动触发/重试分析
   * POST /api/v1/quality/:id/retry
   * Body: { forceRefresh: boolean }
   */
  async triggerAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { forceRefresh } = req.body;

      if (!id) {
        throw new ValidationException({
          field: "id",
          message: "File ID is required",
        });
      }

      // 这里的 forceRefresh 默认为 true，因为通常手动调这个接口就是为了重跑
      const isForce = typeof forceRefresh === "boolean" ? forceRefresh : true;

      // 如果是重试，调用 retryAnalysis (它内部会清理旧数据并强制刷新)
      // 如果只是单纯触发，也可以调 performAnalysis
      // 这里统一使用 retry 语义，更符合前端 "重试" 按钮的场景
      await qualityService.retryAnalysis(id);

      return responseUtils.success(res, null, "分析任务已重新提交");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取质量分析状态（不返回完整结果）
   * GET /api/v1/quality/:id/status
   */
  async getAnalysisStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationException({
          field: "id",
          message: "File ID is required",
        });
      }

      const status = await qualityService.getAnalysisStatus(id);

      return responseUtils.success(res, status, "获取分析状态成功");
    } catch (error) {
      next(error);
    }
  },
};
