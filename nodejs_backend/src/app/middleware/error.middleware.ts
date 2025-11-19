import { Request, Response, NextFunction } from "express"; // 1. 引入类型
import { logger } from "../config/logger.config";

// 2. 定义一个简单的接口来描述 Error 可能包含的属性 (可选，但推荐)
interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction // 3. 必须有 next，否则 Express 无法识别这是错误处理中间件
) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  console.error("❌ Error:", err);

  // 4. 逻辑修复：
  // - 优先使用 err 中的状态码（如果有），否则使用 res.statusCode（如果被手动设置过且不是200），最后默认 500
  // - 注意：Express 默认 res.statusCode 是 200，如果是错误，不能用 200
  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  // - 修复：res 对象上没有 message 属性，应该取 err.message
  const message = err.message || "服务器内部错误";

  res.status(statusCode).json({
    status: "error",
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
