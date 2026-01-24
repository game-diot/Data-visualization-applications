import { Router } from "express";

import { userModificationController } from "../controllers/userModification.controller";
import { cleaningSessionController } from "../controllers/cleaningSession.controller";
import { cleaningTaskController } from "../controllers/cleaningTask.controller";
import { cleaningQueryController } from "../controllers/cleaningQuery.controller";

export const cleaningRouter = Router();

// --- User Modifications ---
cleaningRouter.post(
  "/:fileId/modifications",
  userModificationController.create,
);

cleaningRouter.get("/:fileId/modifications", userModificationController.list);

// --- Cleaning Sessions ---
cleaningRouter.post("/:fileId/sessions", cleaningSessionController.create);
cleaningRouter.get(
  "/:fileId/sessions/active",
  cleaningSessionController.getActive,
);
cleaningRouter.post(
  "/sessions/:sessionsId/closed",
  cleaningSessionController.close,
);

// --- Cleaning Tasks ---
cleaningRouter.post("/:fileId/run", cleaningTaskController.run);

// --- Query Interfaces ---

// 1. 状态查询
cleaningRouter.get("/:fileId/status", cleaningQueryController.getStatus);

// 2. 报告列表 (注意路由顺序，不要被 :version 拦截)
cleaningRouter.get("/:fileId/reports", cleaningQueryController.listReports);

// 3. 报告详情
cleaningRouter.get(
  "/:fileId/reports/:version",
  cleaningQueryController.getReportDetail,
);
