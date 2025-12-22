import { Response } from "express";
import { HTTP_STATUS, HttpStatusCode } from "../constants/http.constant";
import { MESSAGES } from "../constants/messages.constant";
import { ApiResponse } from "../types/api.type";

/**
 * HTTP 响应工具集
 * 职责：标准化成功响应的格式 (错误响应由全局 Error Middleware 处理)
 */
export const responseUtils = {
  /**
   * 发送通用成功响应 (200 OK)
   * @param res Express Response 对象
   * @param data 返回的数据
   * @param message 提示消息 (默认: "操作成功")
   */
  success<T>(
    res: Response,
    data: T | null = null,
    message: string = MESSAGES.SUCCESS
  ) {
    const responseBody: ApiResponse<T> = {
      status: "success",
      code: HTTP_STATUS.OK, // 默认业务码与 HTTP 码一致
      message,
      data: data ?? undefined, // 如果 data 是 null，转为 undefined 以便 JSON 序列化时忽略或保持 null
    };

    return res.status(HTTP_STATUS.OK).json(responseBody);
  },

  /**
   * 发送创建成功响应 (201 Created)
   * @param res Express Response 对象
   * @param data 新创建的资源数据
   * @param message 提示消息 (默认: "创建成功")
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
   * 发送自定义状态码的响应 (仅在特殊业务场景使用)
   */
  custom<T>(
    res: Response,
    data: T,
    statusCode: HttpStatusCode = HTTP_STATUS.OK,
    message: string = MESSAGES.SUCCESS
  ) {
    const responseBody: ApiResponse<T> = {
      status: statusCode >= 400 ? "fail" : "success", // 自动判断状态
      code: statusCode,
      message,
      data,
    };
    return res.status(statusCode).json(responseBody);
  },
};
