import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { getRedisClient } from "../../infrastructure/cache/redis.client";
import { envConfig } from "../config/env.config";
import { ERROR_CODES } from "../../shared/constants/error.constant";
import { HTTP_STATUS } from "../../shared/constants/http.constant";

/**
 * 创建全局限流中间件
 * 职责：基于 Redis 限制 IP 请求频率，防止 DDoS 或恶意刷接口
 */
export const createRateLimiter = () => {
  // 1. 配置 Redis 存储后端
  const store = new RedisStore({
    // 关键修正：通过 wrapper 函数调用，确保运行时获取到最新的 client 实例
    // 且兼容 rate-limit-redis 与 redis v4+ 的类型定义
    sendCommand: async (...args: string[]) => {
      const client = getRedisClient(); // 如果此时 Redis 未连接，这里会抛错，起到保护作用
      return client.sendCommand(args);
    },
    // 可选：为限流 Key 添加前缀，避免与业务缓存冲突
    prefix: "rate_limit:",
  });

  // 2. 返回中间件实例
  return rateLimit({
    windowMs: envConfig.rateLimit.windowMs, // 从统一配置读取 (如 15分钟)
    max: envConfig.rateLimit.max, // 从统一配置读取 (如 100次)

    // 使用标准 Headers (RateLimit-Limit, RateLimit-Remaining, etc.)
    standardHeaders: true,
    legacyHeaders: false,

    // 使用 Redis Store
    store: store,

    // 3. 自定义超限响应 (保持与全局错误处理格式一致)
    handler: (req, res, next, options) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        status: "error",
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: "Too many requests, please try again later.",
      });
    },

    // 如果 Redis 挂了，是否跳过限流？
    // false = 报错 (安全优先), true = 放行 (可用性优先)
    // 建议设为 false，或者由 error middleware 捕获 redis 错误
    passOnStoreError: false,
  });
};
