import type { Request, Response, NextFunction } from "express";

import { analysisQueryService } from "../service/analysisQuery.service";
import { responseUtils } from "@shared/utils/response.util";

export const analysisQueryController = {
  /**
   * GET /api/v1/analysis/:fileId/status?qualityVersion=&cleaningVersion=
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const qVer = req.query.qualityVersion
        ? Number(req.query.qualityVersion)
        : undefined;
      const cVer = req.query.cleaningVersion
        ? Number(req.query.cleaningVersion)
        : undefined;

      const data = await analysisQueryService.getStatus(fileId, qVer, cVer);
      return responseUtils.success(res, data, "操作成功");
    } catch (e) {
      next(e);
    }
  },

  /**
   * GET /api/v1/analysis/:fileId/reports?qualityVersion=&cleaningVersion=
   */
  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const qVer = req.query.qualityVersion
        ? Number(req.query.qualityVersion)
        : undefined;
      const cVer = req.query.cleaningVersion
        ? Number(req.query.cleaningVersion)
        : undefined;

      const data = await analysisQueryService.listReports(fileId, qVer, cVer);
      return responseUtils.success(res, data, "操作成功");
    } catch (e) {
      next(e);
    }
  },

  /**
   * GET /api/v1/analysis/:fileId/reports/:version?qualityVersion=&cleaningVersion=
   */
  async getReportDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId, version } = req.params;
      const qVer = req.query.qualityVersion
        ? Number(req.query.qualityVersion)
        : undefined;
      const cVer = req.query.cleaningVersion
        ? Number(req.query.cleaningVersion)
        : undefined;

      const data = await analysisQueryService.getReportDetail(
        fileId,
        Number(version),
        qVer,
        cVer,
      );
      return responseUtils.success(res, data, "操作成功");
    } catch (e) {
      next(e);
    }
  },
};
