import winston from "winston";
import path from "path";

// 日志文件保存路径
const logDir = "logs";

export const logger = winston.createLogger({
  level: "info", // 日志级别
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    // 输出到控制台
    new winston.transports.Console({ level: "debug" }),

    // 输出到文件
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});
