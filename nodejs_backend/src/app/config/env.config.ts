// src/app/config/env.config.ts
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import path from "path";

// 1. 根据 NODE_ENV 加载对应的环境文件
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

/**
 * 辅助函数：获取环境变量，若缺失则抛出异常
 * 用于强制检查核心依赖，遵循 Fail Fast 原则
 */
const getEnvOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ [Config Fatal] Missing required environment variable: ${key}`
    );
  }
  return value;
};

/**
 * 辅助函数：获取环境变量，若缺失则返回默认值
 */
const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

/**
 * 辅助函数：获取数值型环境变量
 */
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value) {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(
        `❌ [Config Fatal] Environment variable ${key} must be a number`
      );
    }
    return parsed;
  }
  return defaultValue;
};

// 2. 构建强类型配置对象
export const envConfig = Object.freeze({
  // ====================
  // 1. 核心应用配置
  // ====================
  app: {
    env: process.env.NODE_ENV || "development",
    isProd: process.env.NODE_ENV === "production",
    port: getEnvNumber("PORT", 5000),
    apiPrefix: getEnv("API_PREFIX", "/api/v1"),
  },

  // ====================
  // 2. 数据库配置
  // ====================
  mongo: {
    uri: getEnvOrThrow("MONGODB_URL"),
    dbName: getEnv("MONGODB_DB_NAME", "data_v_platform"),
  },

  // ====================
  // 3. 缓存配置
  // ====================
  redis: {
    url: getEnv("REDIS_URL", "redis://localhost:6379"),
    keyPrefix: getEnv("REDIS_KEY_PREFIX", "dv_platform:"),
  },

  // ====================
  // 4. 安全与鉴权
  // ====================
  security: {
    jwtSecret: getEnvOrThrow("JWT_SECRET"),
    jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
    corsOrigin: getEnv("CORS_ORIGIN", "*"), // 生产环境应严格指定
  },

  // ====================
  // 5. 外部服务通信
  // ====================
  clients: {
    fastApi: {
      baseUrl: getEnv("FASTAPI_BASE_URL", "http://localhost:8000"),
      // 默认 5 分钟超时，应对大数据分析场景
      timeout: getEnvNumber("AXIOS_TIMEOUT", 300000),
    },
    react: {
      baseUrl: getEnv("REACT_BASE_URL", "http://localhost:5173"),
    },
  },

  // ====================
  // 6. 文件上传管理
  // ====================
  upload: {
    tempDir: getEnv("UPLOAD_TEMP_DIR", "temp"),
    persistDir: getEnv("UPLOAD_PERSIST_DIR", "uploads"),
    // 默认 50MB
    maxSize: getEnvNumber("MAX_FILE_SIZE", 50 * 1024 * 1024),
  },

  // ====================
  // 7. AI 模块 (LangChain)
  // ====================
  ai: {
    // 允许为空，因为项目初期可能还没配置 AI Key
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: getEnv("LLM_BASE_URL", "https://api.openai.com/v1"),
  },

  // ====================
  // 8. 日志系统
  // ====================
  log: {
    dir: getEnv("LOG_DIR", "logs"),
    level: getEnv("LOG_LEVEL", "info"),
    maxSize: getEnv("LOG_MAX_SIZE", "20m"),
    maxFiles: getEnv("LOG_MAX_FILES", "14d"),
  },
  rateLimit: {
    windowMs: getEnvNumber("RATE_LIMIT_WINDOWMS", 900000),
    max: getEnvNumber("RATE_LIMIT_MAX", 100),
  },
});

// 导出类型
export type EnvConfig = typeof envConfig;
