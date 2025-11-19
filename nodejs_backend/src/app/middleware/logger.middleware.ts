import morgan, { StreamOptions } from "morgan";
import { logger } from "../config/logger.config";

// 1. 显式定义参数类型为 string
// 2. (可选) 使用 StreamOptions 类型接口让代码更规范
const stream: StreamOptions = {
  write: (message: string) => {
    // Morgan 默认会在日志末尾加换行符，Winston 也会加，
    // 所以必须用 trim() 去掉一个，否则你的日志会有很多空行。
    logger.info(message.trim());
  },
};

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);
