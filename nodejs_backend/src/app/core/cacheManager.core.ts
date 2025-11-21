// 关键修正：从配置中导入共享的客户端实例和连接函数
import { redisClient, connectRedis } from "../config/redis.config.js";
import { logger } from "../config/logger.config.js";
// ❌ 移除：重复的 createClient 调用和本地 redis 变量已被删除

export const cacheManager = {
  /**
   * 连接 Redis 客户端。此方法现在委托给通用的 connectRedis 函数。
   * 当 initializeSystem 调用此方法时，它会等待连接完成。
   */
  async connect() {
    try {
      // 关键修正：调用共享的连接函数，确保 rate-limit 依赖的客户端被连接
      await connectRedis();
    } catch (err) {
      // connectRedis 已经打印了错误信息
      logger.error("❌ Redis 连接失败，应用程序将退出。");
      process.exit(1);
    }
  }, // 以下方法现在使用共享的 redisClient 实例

  async set(key: string, value: string, ttl?: number) {
    // 运行时检查：确保客户端已就绪，避免因异步问题导致的挂起
    if (!redisClient.isReady) {
      logger.warn(`⚠️ Redis 客户端未就绪，SET 操作 (${key}) 被跳过。`);
      return null;
    }
    if (ttl) return redisClient.set(key, value, { EX: ttl });
    return redisClient.set(key, value);
  },

  async get(key: string) {
    if (!redisClient.isReady) {
      logger.warn(`⚠️ Redis 客户端未就绪，GET 操作 (${key}) 返回 null。`);
      return null;
    }
    return redisClient.get(key);
  },

  async del(key: string) {
    if (!redisClient.isReady) {
      logger.warn(`⚠️ Redis 客户端未就绪，DEL 操作 (${key}) 返回 0。`);
      return 0;
    }
    return redisClient.del(key);
  },
};
