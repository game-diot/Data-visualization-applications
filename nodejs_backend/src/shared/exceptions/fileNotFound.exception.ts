import { BaseException } from "./base.exception.js";
import { HTTP_STATUS } from "../constants/http.constant.js";
import { ERROR_CODES } from "../constants/error.constant.js";
import { MESSAGES } from "../constants/messages.constants.js";

export class FileNotFoundException extends BaseException {
  constructor(details?: any) {
    super(
      MESSAGES.FILE_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.FILE_NOT_FOUND,
      details
    );
  }
}
