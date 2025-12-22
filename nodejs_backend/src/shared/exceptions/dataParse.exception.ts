import { BaseException } from "./base.exception.js";
import { HTTP_STATUS } from "../constants/http.constant.js";
import { ERROR_CODES } from "../constants/error.constant.js";
import { MESSAGES } from "../constants/messages.constants.js";

export class DataParseException extends BaseException {
  constructor(details?: any) {
    super(
      MESSAGES.FILE_PARSE_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.FILE_PARSE_ERROR,
      details
    );
  }
}
