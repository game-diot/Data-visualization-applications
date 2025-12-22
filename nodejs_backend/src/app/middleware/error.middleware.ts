import { Request, Response, NextFunction } from "express";
import { logger } from "../../shared/utils/logger.util";
import { envConfig } from "../config/env.config";
import { BaseException } from "../../shared/exceptions/base.exception";
import { HTTP_STATUS } from "../../shared/constants/http.constant";
import { ERROR_CODES } from "../../shared/constants/error.constant";

/**
 * 全局错误处理中间件
 * 职责：捕获 BaseException 及未知错误，格式化为统一的 JSON 响应
 */
export const errorMiddleware = (
  err: Error | BaseException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. 防止响应头已发送时的二次报错
  if (res.headersSent) {
    return next(err);
  }

  // 2. 提取错误信息
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode: number = ERROR_CODES.SYSTEM_ERROR;
  let message = "Internal Server Error";
  let details = null;

  // 判断是否为我们自定义的业务异常
  if (err instanceof BaseException) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  } else {
    // 如果是原生 Error (如空指针、类型错误)，统一视为系统级 500 错误
    message = err.message;
  }

  // 3. 记录日志
  // 构造更详细的日志对象，包含 context 信息
  const logContext = {
    errorCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    details, // 记录详细的错误上下文
    stack: err.stack,
  };

  // 4xx 视为警告，5xx 视为错误
  if (statusCode >= 500) {
    logger.error(`🚨 [Server Error] ${message}`, logContext);
  } else {
    logger.warn(`⚠️ [Client Error] ${message}`, logContext);
  }

  // 4. 构建返回给前端的响应体
  const response: any = {
    status: "error",
    code: errorCode, // 前端依靠这个 code 做具体判断
    message: message,
    details: details, // 透传验证错误详情 (如：字段 x 不能为空)
  };

  // 开发环境附加堆栈
  if (!envConfig.app.isProd) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
