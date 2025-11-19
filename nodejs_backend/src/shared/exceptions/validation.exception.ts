import { BaseException } from "./base.exception.js";
import { HTTP_STATUS } from "../constants/httpStatusCode.constant.js";
import { ERROR_CODES } from "../constants/errorCodes.constants.js";
import { MESSAGES } from "../constants/messages.constants.js";

export class ValidationException extends BaseException {
  constructor(details?: any) {
    super(
      MESSAGES.PARAMS_INVALID,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INVALID_PARAMS,
      details
    );
  }
}
