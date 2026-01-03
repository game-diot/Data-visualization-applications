import { Response } from "express";
import { HTTP_STATUS, HttpStatusCode } from "../constants/http.constant";
import { MESSAGES } from "../constants/messages.constant";
import { ApiResponse } from "../types/api.type";

/**
 * HTTP 响应工具集
 * - success / created / custom 已有
 * - 新增 fail / error 响应
 */
export const responseUtils = {
  /**
   * 发送通用成功响应 (200 OK)
   */
  success<T>(
    res: Response,
    data: T | null = null,
    message: string = MESSAGES.SUCCESS
  ) {
    const responseBody: ApiResponse<T> = {
      status: "success",
      code: HTTP_STATUS.OK,
      message,
      data: data ?? undefined,
    };
    return res.status(HTTP_STATUS.OK).json(responseBody);
  },

  /**
   * 发送创建成功响应 (201 Created)
   */
  created<T>(
    res: Response,
    data: T | null = null,
    message: string = MESSAGES.CREATED
  ) {
    const responseBody: ApiResponse<T> = {
      status: "success",
      code: HTTP_STATUS.CREATED,
      message,
      data: data ?? undefined,
    };
    return res.status(HTTP_STATUS.CREATED).json(responseBody);
  },

  /**
   * 发送自定义状态码响应 (success 或 fail)
   */
  custom<T>(
    res: Response,
    data: T,
    statusCode: HttpStatusCode = HTTP_STATUS.OK,
    message: string = MESSAGES.SUCCESS
  ) {
    const responseBody: ApiResponse<T> = {
      status: statusCode >= 400 ? "fail" : "success",
      code: statusCode,
      message,
      data,
    };
    return res.status(statusCode).json(responseBody);
  },

  /**
   * 发送业务错误响应 (fail)
   * @param res Express Response
   * @param message 错误信息
   * @param statusCode HTTP 状态码 (默认 400)
   * @param data 可选额外信息
   */
  fail<T = any>(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.BAD_REQUEST,
    data?: T
  ) {
    const responseBody: ApiResponse<T> = {
      status: "fail",
      code: statusCode,
      message,
      data,
    };
    return res.status(statusCode).json(responseBody);
  },

  /**
   * 发送服务器异常响应 (error)
   * @param res Express Response
   * @param message 错误信息
   * @param statusCode HTTP 状态码 (默认 500)
   * @param data 可选额外信息
   */
  error<T = any>(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    data?: T
  ) {
    const responseBody: ApiResponse<T> = {
      status: "error",
      code: statusCode,
      message,
      data,
    };
    return res.status(statusCode).json(responseBody);
  },
};
