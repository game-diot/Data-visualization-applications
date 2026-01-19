import { Request, Response, NextFunction } from "express";
import { cleaningQueryService } from "../service/cleaningQuery.service";
import { responseUtils } from "../../../shared/utils/response.util";

export const cleaningQueryController = {
  /**
   * GET /api/v1/cleaning/:fileId/status
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const qVer = req.query.qualityVersion
        ? Number(req.query.qualityVersion)
        : undefined;

      const result = await cleaningQueryService.getCleaningStatus(fileId, qVer);
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaning/:fileId/reports
   */
  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      // 列表接口通常强制要求 qualityVersion，或者也可以默认最新
      const qVer = Number(req.query.qualityVersion);

      if (isNaN(qVer)) {
        return responseUtils.fail(res, "qualityVersion is required", 400);
      }

      const result = await cleaningQueryService.listReports(fileId, qVer);
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaning/:fileId/reports/:version
   */
  async getReportDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId, version } = req.params;
      const qVer = Number(req.query.qualityVersion);

      if (isNaN(qVer)) {
        return responseUtils.fail(res, "qualityVersion is required", 400);
      }

      const result = await cleaningQueryService.getReportDetail(
        fileId,
        qVer,
        Number(version)
      );
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
