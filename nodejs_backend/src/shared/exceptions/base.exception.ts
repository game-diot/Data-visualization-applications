import { HTTP_STATUS } from "../constants/http.constant.js";
import { ERROR_CODES } from "../constants/error.constant.js";

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

    // 1. 设置错误名称 (这对日志非常重要)
    this.name = this.constructor.name;

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    // 2. 修复 TypeScript 继承内置类的原型链问题 (关键)
    Object.setPrototypeOf(this, new.target.prototype);

    // 3. 捕获堆栈 (保持你原来的写法，这在 V8/Node.js 中很好用)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
