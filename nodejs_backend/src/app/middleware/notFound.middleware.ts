import { Request, Response, NextFunction } from "express";
import { BaseException } from "../../shared/exceptions/base.exception";
import { HTTP_STATUS } from "../../shared/constants/http.constant";
import { ERROR_CODES } from "../../shared/constants/error.constant";

/**
 * 404 处理中间件
 * 职责：捕获所有未被路由匹配的请求，抛出标准 404 异常给全局错误处理器
 * 位置：必须放在所有路由之后，errorMiddleware 之前
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new BaseException(
    `Route not found: ${req.method} ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND
  );

  // 将错误传递给下一个中间件 (即 errorMiddleware)
  next(error);
};
