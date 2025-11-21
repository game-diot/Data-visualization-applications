import { createClient } from "redis";
import { config } from "./env.config"; // 导入统一配置
import { logger } from "./logger.config"; // 导入统一日志工具

const REDIS_URL = config.redisUrl ?? "redis://localhost:6379";

export const redisClient = createClient({
  url: REDIS_URL,
});

// 将成功日志移入 connectRedis 函数

redisClient.on("error", (err) => {
  // 仅用于记录错误，不执行任何关闭或退出操作
  logger.error("⚠️ Redis 运行时错误:", err);
});

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    logger.info("🔌 Redis 已处于打开状态");
    return;
  }

  try {
    // 异步连接
    await redisClient.connect();

    // ✅ 确保只有在 connect 成功后才打印成功信息
    logger.info("✅ Redis connected");
  } catch (error) {
    // 关键：如果连接失败，抛出错误，让调用者 (initializeSystem) 处理退出
    logger.error("❌ Redis 连接失败，请检查服务是否运行:", error);
    throw error;
  }
};
