import { Response } from "express";
import { ApiResponse } from "../types/apiResponse.type.js";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  msg: string,
  data: T | null = null
) => {
  const body: ApiResponse<T> = {
    code: statusCode,
    msg,
  };

  if (data !== null) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};
