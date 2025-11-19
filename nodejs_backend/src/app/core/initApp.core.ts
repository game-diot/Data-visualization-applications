// src/app/core/initApp.core.ts
import express, { Application } from "express";
import { corsMiddleware } from "../middleware/cors.middleware.js";
import { requestLogger } from "../middleware/logger.middleware.js";
import { errorHandler } from "../middleware/error.middleware.js";
import { apiRouter } from "../routes/index.js";
import { createRateLimiter } from "../middleware/rate-limit.middleware.js";

export const initApp = (): Application => {
  const app = express();

  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json());
  app.use(createRateLimiter());

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
};
