import morgan from "morgan";
import { envConfig } from "../config/env.config";
import { stream } from "../../shared/utils/logger.util";

/**
 * HTTP 请求日志中间件
 * 职责：拦截所有请求，记录访问日志 (Method, URL, Status, Time)
 */

// 1. 根据环境选择日志格式
// "dev": 简洁、带颜色 (开发用) -> GET /api/v1/health 200 5.123 ms
// "combined": 标准 Apache 格式 (生产用) -> ::1 - - [Date] "GET /..." 200 ...
const logFormat = envConfig.app.isProd ? "combined" : "dev";

// 2. 导出中间件
export const requestLogger = morgan(logFormat, {
  stream: stream, // 直接使用 shared/utils/logger.ts 中导出的流
  // 可选：跳过健康检查接口的日志，避免生产环境日志刷屏
  skip: (req) => req.url === "/api/v1/health" || req.url === "/health",
});
