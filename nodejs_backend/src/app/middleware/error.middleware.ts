// src/app/middleware/errorHandler.ts (优化后的框架)
import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.config"; // 导入统一日志
import { config } from "../config/env.config"; // 导入统一配置

// 2. 导出 AppError 接口，确保所有抛出自定义错误的模块都能正确引用此类型
export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 仅使用 logger 记录错误，并附加 Error 对象，让 logger 处理堆栈提取
  logger.error(`${req.method} ${req.url} - ${err.message}`, { error: err });

  // ... 状态码确定逻辑不变 ...
  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  const message = err.message || "服务器内部错误";

  res.status(statusCode).json({
    status: "error",
    message,
    // 使用 config.env 确保环境敏感性
    error: config.env === "development" ? err.stack : undefined,
  });
};
