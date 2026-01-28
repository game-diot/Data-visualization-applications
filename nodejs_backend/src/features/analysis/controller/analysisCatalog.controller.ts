import { responseUtils } from "@shared/utils/response.util";
import type { Request, Response, NextFunction } from "express";
import { analysisCatalogService } from "../service/analysisiCatalog.service";

export const analysisCatalogController = {
  /**
   * GET /api/v1/analysis/:fileId/catalog
   * query: qualityVersion?, selectedColumns? (comma separated)
   */
  async getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const qualityVersion = req.query.qualityVersion
        ? Number(req.query.qualityVersion)
        : undefined;
      const selectedColumns = req.query.selectedColumns
        ? String(req.query.selectedColumns)
        : undefined;

      const data = await analysisCatalogService.getCatalog(
        fileId,
        qualityVersion,
        selectedColumns,
      );
      return responseUtils.success(res, data, "操作成功");
    } catch (e) {
      next(e);
    }
  },
};
