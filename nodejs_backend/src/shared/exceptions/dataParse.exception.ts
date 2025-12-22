import { BaseException } from "./base.exception";
import { HTTP_STATUS } from "../constants/http.constant";
import { ERROR_CODES } from "../constants/error.constant";
import { MESSAGES } from "../constants/messages.constant";

/**
 * 数据解析异常
 * 场景：上传的文件格式损坏、内容不符合模板、无法读取等
 */
export class DataParseException extends BaseException {
  /**
   * @param message 自定义错误信息 (可选，默认使用 "文件解析失败")
   * @param details 具体的错误详情 (可选，如具体的解析报错堆栈)
   */
  constructor(message?: string, details?: any) {
    super(
      message || MESSAGES.FILE_PARSE_ERROR, // 优先使用传入的消息，否则用默认
      HTTP_STATUS.UNPROCESSABLE_ENTITY, // 422: 语义错误/无法处理的实体
      ERROR_CODES.FILE_PARSE_ERROR, // 对应 30004
      details
    );
  }
}
