// src/config/redis.config.ts (修正和简化后的版本)
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redisClient = createClient({
  url: REDIS_URL,
});

// ❌ 移除顶层的 connect 事件监听，将成功日志移入 connectRedis 函数

redisClient.on("error", (err) => {
  // 仅用于记录错误，不执行任何关闭或退出操作
  console.error("⚠️ Redis 运行时错误:", err);
});

export const connectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    console.log("🔌 Redis 已处于打开状态");
    return;
  }

  try {
    // 异步连接
    await redisClient.connect();

    // ✅ 确保只有在 connect 成功后才打印成功信息
    console.log("✅ Redis connected");
  } catch (error) {
    // 关键：如果连接失败，抛出错误，让调用者 (initializeSystem) 处理退出
    console.error("❌ Redis 连接失败，请检查服务是否运行:", error);
    throw error;
  }
};
