import { getRedisClient } from "./redis.client";
import { logger } from "../../shared/utils/logger.util";

/**
 * Redis 缓存操作助手
 * 职责：封装 Redis 基础命令，提供自动 JSON 序列化/反序列化，屏蔽底层 Client 细节
 */
export const cacheHelper = {
  /**
   * 设置缓存
   * @param key 键
   * @param value 值 (对象会自动序列化)
   * @param ttlSeconds 过期时间 (秒)，可选
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = getRedisClient();
      // 自动序列化对象
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      if (ttlSeconds) {
        await client.set(key, stringValue, { EX: ttlSeconds });
      } else {
        await client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      // 缓存写入失败不应阻断主业务，记录错误即可
      logger.error(
        `❌ [CacheHelper] SET failed for key: ${key}. Error: ${error}`
      );
      return false;
    }
  },

  /**
   * 获取缓存
   * @param key 键
   * @returns 泛型 T | null
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const data = await client.get(key);

      if (!data) return null;

      // 尝试解析 JSON
      try {
        return JSON.parse(data) as T;
      } catch {
        // 如果不是 JSON，直接返回字符串
        return data as unknown as T;
      }
    } catch (error) {
      logger.error(
        `❌ [CacheHelper] GET failed for key: ${key}. Error: ${error}`
      );
      return null;
    }
  },

  /**
   * 删除缓存
   */
  async del(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      return await client.del(key);
    } catch (error) {
      logger.error(
        `❌ [CacheHelper] DEL failed for key: ${key}. Error: ${error}`
      );
      return 0;
    }
  },

  /**
   * 获取键的剩余生存时间
   */
  async ttl(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      return await client.ttl(key);
    } catch (error) {
      return -2;
    }
  },
};
