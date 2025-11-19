import winston from "winston";
import "winston-daily-rotate-file"; // 引入日志轮转插件
import path from "path";

// 定义日志目录
const logDir = "logs";

// 1. 定义不同环境的日志格式
// 开发环境：带颜色、自定义简单格式，方便人眼看
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }), // 开启颜色
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    // 如果有 stack (错误堆栈)，优先打印 stack
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

// 生产环境：JSON 格式，方便日志系统采集和分析
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json() // 输出结构化数据
);

// 2. 创建 Logger
export const logger = winston.createLogger({
  // 默认级别：生产环境只看 info，开发环境看 debug
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // 关键：处理 Error 对象，自动提取 stack 属性
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "production" ? prodFormat : devFormat
  ),

  transports: [
    // A. 控制台输出
    new winston.transports.Console(),

    // B. 错误日志文件（按天轮转）
    // 每天生成一个文件，最多保留 14 天，单个文件最大 20MB
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true, // 压缩旧日志
      maxSize: "20m",
      maxFiles: "14d",
    }),

    // C. 所有日志文件（按天轮转）
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
