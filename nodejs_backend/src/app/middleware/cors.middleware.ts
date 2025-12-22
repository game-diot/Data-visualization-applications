import cors, { CorsOptions } from "cors";
import { envConfig } from "../config/env.config";
import { logger } from "../../shared/utils/logger.util";

/**
 * 构建允许的来源列表
 * 策略：
 * 1. 始终包含配置中的 React Base URL
 * 2. 如果是开发环境，额外宽容 localhost 和 127.0.0.1，方便调试
 */
const getAllowedOrigins = (): string[] => {
  const { isProd } = envConfig.app;
  const { baseUrl } = envConfig.clients.react;

  const origins = [baseUrl];

  // 生产环境也可以通过 envConfig.security.corsOrigin 注入额外域名
  if (envConfig.security.corsOrigin && envConfig.security.corsOrigin !== "*") {
    origins.push(envConfig.security.corsOrigin);
  }

  // 开发环境：宽容模式
  if (!isProd) {
    return [
      ...origins,
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000", // 兼容可能的旧端口
    ];
  }

  return origins;
};

// CORS 配置
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // 1. 允许无 Origin 的请求 (如 Postman, cURL, 或同源请求)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = getAllowedOrigins();

    // 2. 检查 Origin 是否在白名单中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 3. 拦截并记录日志 (非常重要，否则前端只会报 Network Error，不知道原因)
      logger.warn(`🛑 [CORS] Blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
    "Accept",
  ],
  credentials: true, // 允许携带 Cookie/Session
  preflightContinue: false,
  optionsSuccessStatus: 204, // 某些旧浏览器 (IE11) 需要 204
};

// 导出配置好的中间件
export const corsMiddleware = cors(corsOptions);
