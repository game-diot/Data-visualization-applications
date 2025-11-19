import { HTTP_STATUS } from "../constants/httpStatusCode.constant.js";
import { ERROR_CODES } from "../constants/errorCodes.constants.js";

export class BaseException extends Error {
  public statusCode: number;
  public errorCode: number;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: number = ERROR_CODES.SYSTEM_ERROR,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
