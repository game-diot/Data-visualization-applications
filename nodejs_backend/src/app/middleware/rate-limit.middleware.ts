// src/middleware/rate-limit.middleware.ts (最终修正版)
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redis.config.js";
import { config } from "../config/env.config.js";
export const createRateLimiter = () => {
  // 💡 关键修正：在创建 RedisStore 之前，检查客户端是否处于 READY 状态。
  // 这有助于捕获连接成功后立即关闭的情况。
  if (!redisClient.isReady) {
    throw new Error(
      `❌ Redis client is not ready (Status: ${redisClient.status}). 
            Ensure connectRedis() finished successfully and no code called .quit() afterward.`
    );
  }

  const store = new RedisStore({
    // ❌ 移除 client: redisClient, 这一行！

    // ✅ 只保留 sendCommand
    sendCommand: async (...args: string[]) => {
      // 注意：args 在这里已经是数组，所以传入 sendCommand(args) 是正确的
      return await redisClient.sendCommand(args);
    },
  });

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { error: "Too many requests, please try again later." },

    standardHeaders: true,
    legacyHeaders: false,
    store: store,
  });
};
