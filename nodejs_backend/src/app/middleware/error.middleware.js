import { logger } from "../../shared/utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  console.error("❌ Error:", err);

  const statusCode = res.statusCode || 500;
  const message = res.message || "服务器内部错误";

  res.status(statusCode).json({
    status: "error",
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
