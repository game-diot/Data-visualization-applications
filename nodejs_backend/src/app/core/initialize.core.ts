// src/app/core/initialize.core.ts
import { initDirectories } from "./initDirectories.core.js";
import { cacheManager } from "./cacheManager.core.js";
import { connectDB } from "../config/database.config.js";
import { config } from "../config/env.config.js";
export const initializeSystem = async () => {
  console.log("🚀 Initializing system...");

  // 💡 打印关键信息，便于调试
  console.log(`[Config] NODE_ENV: ${config.env}`);
  console.log(`[DB] URI: ${config.mongoUri ? "Loaded" : "❌ NOT FOUND"}`); // 检查是否已加载 DB URI

  initDirectories(); // 创建 logs、uploads 等目录
  await connectDB(); // 连接 MongoDB
  await cacheManager.connect(); // 连接 Redis

  console.log("✨ System initialization complete.");
};
