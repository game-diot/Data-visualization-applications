import { Request, Response, NextFunction } from "express";
import { userModificationService } from "../service/userModification.service";
import { responseUtils } from "../../../shared/utils/response.util";
import { CreateUserModificationDTO } from "../dto/userModification.dto";

export const userModificationController = {
  /**
   * POST /api/v1/cleaning/:fileId/modifications
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const body = req.body as CreateUserModificationDTO;

      // 简单参数校验 (生产环境建议用 class-validator)
      if (!body.sessionId || !Array.isArray(body.modifications)) {
        return responseUtils.fail(res, "Invalid payload", 400);
      }

      const result = await userModificationService.addModification(
        fileId,
        body
      );

      return responseUtils.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaning/:fileId/modifications?sessionId=xxx
   * 注意：通常建议把 sessionId 放在 query 参数里，因为一个文件可能有多个 Session
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.query;

      if (!sessionId || typeof sessionId !== "string") {
        return responseUtils.fail(res, "sessionId is required in query", 400);
      }

      const result = await userModificationService.listModifications(sessionId);

      return responseUtils.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
