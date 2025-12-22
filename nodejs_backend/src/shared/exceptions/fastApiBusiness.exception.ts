import { HTTP_STATUS } from "@shared/constants/http.constant";
import { BaseException } from "./base.exception";

export class FastApiBusinessException extends BaseException {
  public readonly businessCode: number;

  constructor(msg: string, businessCode: number, details?: unknown) {
    // 外部 API 业务错误统一使用 502/503 状态码
    super(
      msg || `FastAPI 业务错误 (Code: ${businessCode})`,
      HTTP_STATUS.BAD_GATEWAY,
      businessCode,
      details
    );
    this.businessCode = businessCode;
  }
}
