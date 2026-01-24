import { Router, Request, Response, NextFunction } from "express";
import { qualityController } from "../controllers/quality.controller";

const qualityRouter = Router();

// ==========================================
// Quality Feature Routes
// Base Path: /api/v1/quality
// ==========================================

// Middleware to validate MongoDB ObjectId (Replacing the regex in the path)
const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const oidRegex = /^[0-9a-fA-F]{24}$/;

  if (!oidRegex.test(id)) {
    // Return 404 or 400 if the ID format is invalid, preventing the controller from running
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// Apply validation to all routes requiring :id
qualityRouter.use("/:id", validateId);

// simplified routes
qualityRouter.get("/:id/summary", qualityController.getAnalysisSummary);
qualityRouter.get("/:id/status", qualityController.getAnalysisStatus);

// For the version route, we validate version inside the handler or a specific middleware
qualityRouter.get(
  "/:id/version/:version",
  qualityController.getAnalysisResultByVersion,
);

qualityRouter.get("/:id", qualityController.getAnalysisResult);
qualityRouter.post("/:id/retry", qualityController.triggerAnalysis);

export { qualityRouter };
