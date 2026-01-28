import type { Request, Response, NextFunction } from "express";

import { analysisTaskService } from "../service/analysisTask.service";
import type { AnalysisRunRequestDTO } from "../dto/analysisRunRequest.dto";
import { responseUtils } from "@shared/utils/response.util";

export const analysisTaskController = {
  /**
   * POST /api/v1/analysis/:fileId/run
   */
  async run(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;

      const body = req.body as AnalysisRunRequestDTO;
      // 基础防御：analysisConfig 必填
      if (!body?.analysisConfig) {
        return responseUtils.fail(res, "analysisConfig is required", 400);
      }
      // qualityVersion 必填（你也可以允许 service 内默认取 latestQualityVersion）
      if (!body.qualityVersion) {
        return responseUtils.fail(res, "qualityVersion is required", 400);
      }

      // 触发 task（异步）
      const task = await analysisTaskService.triggerAnalysis(fileId, body);

      // 201 Created：返回 task（pending）
      return responseUtils.created(res, task, "Analysis task started");
    } catch (e) {
      next(e);
    }
  },
};
