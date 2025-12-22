import { createClient, RedisClientType } from "redis";
import { envConfig } from "../../app/config/env.config";
import { logger } from "../../shared/utils/logger.util";

// 1. 定义私有客户端变量 (单例模式)
let redisClient: RedisClientType | null = null;

/**
 * 初始化 Redis 连接
 * 职责：由 main.ts 在启动时调用，建立物理连接
 */
export const initRedis = async (): Promise<void> => {
  // 防止重复初始化
  if (redisClient && redisClient.isOpen) {
    logger.warn("🔌 [Redis] Client is already connected.");
    return;
  }

  const { url, keyPrefix } = envConfig.redis;

  // 2. 创建客户端实例
  redisClient = createClient({
    url: url,
    // 生产环境建议设置 key 前缀，防止与其他应用冲突
    // prefix: keyPrefix, // 注意：node-redis v4 的 prefix 配置方式可能有所不同，通常在 command 层面或隔离 db
    socket: {
      // 失败重连策略
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error("❌ [Redis] Max reconnection attempts reached.");
          return new Error("Max reconnection attempts reached");
        }
        const delay = Math.min(retries * 100, 3000);
        logger.warn(
          `🔁 [Redis] Reconnecting attempt ${retries} in ${delay}ms...`
        );
        return delay;
      },
    },
  });

  // 3. 绑定事件监听 (替代 console.log)
  redisClient.on("error", (err) => {
    logger.error(`❌ [Redis] Client Error: ${err}`);
  });

  redisClient.on("connect", () => {
    logger.info("🔌 [Redis] Initiating connection...");
  });

  redisClient.on("ready", () => {
    logger.info(`✅ [Redis] Connection ready at ${url}`);
  });

  redisClient.on("end", () => {
    logger.warn("🛑 [Redis] Connection ended");
  });

  // 4. 执行连接
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error(
      "🚨 [Redis] Fatal: Could not connect to Redis during startup."
    );
    // Redis 连接失败通常视为致命错误，需要中断启动
    throw error;
  }
};

/**
 * 获取 Redis 客户端实例
 * ⚠️ 警告：仅限 infrastructure/cache 内部 Helper 使用
 * 业务层 (Features) 应调用 CacheHelper 而不是直接操作此 Client
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error(
      "❌ [Redis] Client not initialized. Call initRedis() first."
    );
  }
  return redisClient;
};

/**
 * 优雅关闭连接
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info("🛑 [Redis] Connection closed gracefully");
  }
};
