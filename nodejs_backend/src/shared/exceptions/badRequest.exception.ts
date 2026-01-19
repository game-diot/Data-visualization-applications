import { BaseException } from "./base.exception";
import { HTTP_STATUS } from "../constants/http.constant";
import { ERROR_CODES } from "../constants/error.constant";

export class BadRequestException extends BaseException {
  constructor(message: string = "Bad Request", details?: any) {
    super(
      message,
      HTTP_STATUS.BAD_REQUEST, // 确保你的常量里有这个 (400)
      ERROR_CODES.VALIDATION_ERROR, // 确保你的常量里有这个 (例如 40000 或 1001)
      details
    );
  }
}
