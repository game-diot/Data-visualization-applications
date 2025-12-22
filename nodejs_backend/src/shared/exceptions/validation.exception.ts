import { BaseException } from "./base.exception.js";
import { HTTP_STATUS } from "../constants/http.constant.js";
import { ERROR_CODES } from "../constants/error.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

// 定义一个验证错误的详情结构，方便前端解析
export interface ValidationErrorDetail {
  field: string; // 出错的字段名，例如 "username"
  message: string; // 具体错误信息，例如 "用户名不能为空"
}

export class ValidationException extends BaseException {
  // 这里把 any 改得更具体一点，或者保持 any 但注释说明结构
  constructor(details?: ValidationErrorDetail[] | any) {
    super(
      MESSAGES.PARAMS_INVALID,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_PARAMS,
      details
    );
  }
}
