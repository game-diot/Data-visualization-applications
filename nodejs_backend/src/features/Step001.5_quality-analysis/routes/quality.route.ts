import { Router } from "express";
import { qualityController } from "../controllers/quality.controller";

const qualityRouter = Router();

// ==========================================
// Quality Feature Routes
// Base Path: /api/v1/quality
// ==========================================

// 1. 获取特定文件的分析结果
// GET /api/v1/quality/:id
qualityRouter.get("/:id", qualityController.getAnalysisResult);
// 获取指定 version 的分析结果
qualityRouter.get(
  "/:id/version/:version",
  qualityController.getAnalysisResultByVersion
);
// 2. 手动触发/重试分析
// POST /api/v1/quality/:id/analyze
qualityRouter.post("/:id/retry", qualityController.triggerAnalysis);

qualityRouter.get("/:id/status", qualityController.getAnalysisStatus);

export { qualityRouter };
