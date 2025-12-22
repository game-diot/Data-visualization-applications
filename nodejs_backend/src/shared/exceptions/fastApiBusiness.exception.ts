import { HTTP_STATUS } from "@shared/constants/http.constant";
import { BaseException } from "./base.exception";

export class FastApiBusinessException extends BaseException {
  // 移除: public readonly businessCode;  (父类已经有 errorCode 了)

  constructor(msg: string, businessCode: number, details?: unknown) {
    super(
      msg || `FastAPI 业务错误 (Code: ${businessCode})`,
      HTTP_STATUS.BAD_GATEWAY, // 502 非常合适，明确表示是"上游"的问题
      businessCode, // 这里会自动赋值给 this.errorCode
      details
    );
    // 移除: this.businessCode = businessCode;
  }
}
