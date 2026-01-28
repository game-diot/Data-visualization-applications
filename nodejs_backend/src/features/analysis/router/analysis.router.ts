import { Router } from "express";
import { analysisCatalogController } from "../controller/analysisCatalog.controller";
import { analysisQueryController } from "../controller/analysisQuery.controller";
import { analysisTaskController } from "../controller/analysisTask.controller";

const analysisRouter = Router();

// GET /api/v1/analysis/:fileId/catalog
analysisRouter.get("/:fileId/catalog", analysisCatalogController.getCatalog);

// query
analysisRouter.get("/:fileId/status", analysisQueryController.getStatus);
analysisRouter.get("/:fileId/reports", analysisQueryController.listReports);
analysisRouter.get(
  "/:fileId/reports/:version",
  analysisQueryController.getReportDetail,
);

// POST /api/v1/analysis/:fileId/run
analysisRouter.post("/:fileId/run", analysisTaskController.run);
export { analysisRouter };
