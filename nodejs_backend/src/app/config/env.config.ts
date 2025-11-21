// src/app/config/env.config.ts (优化后的版本)
import dotenv from "dotenv";
import path from "path";

// 根据环境加载不同的 .env 文件
const envFile: string =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// 定义日志配置接口
interface ILogConfig {
  logDir: string;
  maxSize: string;
  maxFiles: string;
}

// 定义主配置接口 (新增字段)
interface IConfig {
  env: string | undefined;
  port: number;
  // MongoDB 配置
  mongoUri: string | undefined;
  mongoDbName: string | undefined; // <--- 新增
  // Redis 配置
  redisUrl: string; // <--- 新增
  windowMs: number;
  max: number;
  //FastAPI URL端口
  fastUrl: string;
  //React URL 端口
  reactUrl: string;
  // JWT
  jwtSecret: string | undefined;
  // Logger 配置
  logConfig: ILogConfig; // <--- 新增嵌套配置
}

export const config: IConfig = {
  env: process.env.NODE_ENV,
  port: process.env.PORT ? Number(process.env.PORT) : 5000,

  // MongoDB 配置
  mongoUri: process.env.MONGODB_URL,
  mongoDbName: process.env.MONGODB_DB_NAME, // <--- 新增

  // Redis 配置 (提供默认值)
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379", // <--- 新增
  windowMs: 15 * 60 * 1000,
  max: 100,

  //React
  reactUrl: process.env.REACT_BASE_URL ?? "http://localhost:3000",
  //FastAPI
  fastUrl: process.env.FASTAPI_BASE_URL ?? "http://localhost:8000",
  // JWT
  jwtSecret: process.env.JWT_SECRET,

  // Logger 配置 (提供默认值)
  logConfig: {
    // <--- 新增
    logDir: process.env.LOG_DIR ?? "logs",
    maxSize: process.env.LOG_MAX_SIZE ?? "20m",
    maxFiles: process.env.LOG_MAX_FILES ?? "14d",
  },
};
