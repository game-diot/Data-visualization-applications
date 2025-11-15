import morgan from "morgan";
import { logger } from "../../shared/utils/logger.js";

// 自定义 morgan 输出到 winston
const stream = {
  write: (message) => logger.info(message.trim()),
};

export const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream }
);
