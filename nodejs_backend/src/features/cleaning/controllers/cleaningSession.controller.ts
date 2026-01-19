import { Request, Response, NextFunction } from "express";
import { cleaningSessionService } from "../service/cleaningSession.service";
import { responseUtils } from "../../../shared/utils/response.util";

export const cleaningSessionController = {
  /**
   * POST /api/v1/cleaning/:fileId/sessions
   * Body: { qualityVersion: number }
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const { qualityVersion } = req.body;

      if (qualityVersion === undefined) {
        return responseUtils.fail(res, "qualityVersion is required", 400);
      }

      const result = await cleaningSessionService.createSession(
        fileId,
        qualityVersion
      );
      return responseUtils.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaning/:fileId/sessions/active?qualityVersion=N
   */
  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const qualityVersion = Number(req.query.qualityVersion);

      if (isNaN(qualityVersion)) {
        return responseUtils.fail(
          res,
          "qualityVersion query param is required",
          400
        );
      }

      const result = await cleaningSessionService.getActiveSession(
        fileId,
        qualityVersion
      );
      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/cleaning/sessions/:sessionId/close
   */
  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const result = await cleaningSessionService.closeSession(sessionId);
      return responseUtils.success(res, result, "Session closed successfully");
    } catch (error) {
      next(error);
    }
  },
};
