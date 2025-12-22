import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
// 引用最新的强类型配置
import { envConfig } from "../../app/config/env.config";

// 1. 从配置中心解构参数
const { dir, level, maxSize, maxFiles } = envConfig.log;
const { isProd } = envConfig.app;

// 2. 确保日志目录是绝对路径 (工程化细节)
const logDirectory = path.isAbsolute(dir)
  ? dir
  : path.resolve(process.cwd(), dir);

// 3. 定义格式
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json() // 生产环境使用 JSON，方便后续接入 ELK 或类似系统
);

// 4. 创建 Logger 实例
export const logger = winston.createLogger({
  level: level, // 使用 env.config 中的 LOG_LEVEL (默认 info)
  format: winston.format.combine(
    winston.format.errors({ stack: true }), // 自动捕获 Error 对象的堆栈
    isProd ? prodFormat : devFormat
  ),
  transports: [
    // A. 控制台输出
    new winston.transports.Console(),

    // B. 错误日志 (只记录 error 级别)
    new winston.transports.DailyRotateFile({
      dirname: logDirectory, // 使用绝对路径
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true, // 归档压缩
      maxSize: maxSize,
      maxFiles: maxFiles,
    }),

    // C. 组合日志 (记录所有级别)
    new winston.transports.DailyRotateFile({
      dirname: logDirectory, // 使用绝对路径
      filename: "combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: maxSize,
      maxFiles: maxFiles,
    }),
  ],
});

// 5. 导出 Stream (供 Morgan HTTP 日志中间件使用)
export const stream = {
  write: (message: string) => {
    // Morgan 输出通常自带换行符，这里 trim 掉以免日志里多余空行
    logger.info(message.trim());
  },
};
