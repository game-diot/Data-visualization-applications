import { BaseException } from "./base.exception.js";
import { HTTP_STATUS } from "../constants/http.constant.js";
import { ERROR_CODES } from "../constants/error.constant.js";
import { MESSAGES } from "../constants/messages.constant.js";

export class FileNotFoundException extends BaseException {
  // 允许传入 msg 覆盖默认值，或者只传 details
  constructor(msgOrDetails?: string | any, details?: any) {
    let message: string = MESSAGES.FILE_NOT_FOUND;
    let actualDetails = details;

    if (typeof msgOrDetails === "string") {
      message = msgOrDetails;
    } else if (msgOrDetails) {
      actualDetails = msgOrDetails;
    }

    super(
      message,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.FILE_NOT_FOUND,
      actualDetails
    );
  }
}
