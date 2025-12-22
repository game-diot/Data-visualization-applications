import { BaseException } from "./base.exception.js";
import { HTTP_STATUS } from "../constants/http.constant.js";
import { ERROR_CODES } from "../constants/error.constant.js";
import { MESSAGES } from "../constants/messages.constants.js";

export class AuthException extends BaseException {
  constructor(message: string = MESSAGES.UNAUTHORIZED, details?: any) {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, details);
  }
}
