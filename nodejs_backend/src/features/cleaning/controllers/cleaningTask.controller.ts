import { Request, Response, NextFunction } from "express";
import { cleaningTaskService } from "../service/cleaningTask.service";
import { responseUtils } from "../../../shared/utils/response.util";

export const cleaningTaskController = {
  /**
   * POST /api/v1/cleaning/:fileId/run
   * Body: { sessionId: string, cleanRules?: any }
   */
  async run(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const { sessionId, cleanRules } = req.body;

      if (!sessionId) {
        return responseUtils.fail(res, "sessionId is required", 400);
      }

      // 立即返回 Created 状态，包含 Task ID
      const task = await cleaningTaskService.triggerCleaning(
        fileId,
        sessionId,
        cleanRules
      );

      return responseUtils.created(res, task, "Cleaning task started");
    } catch (error) {
      next(error);
    }
  },
};
