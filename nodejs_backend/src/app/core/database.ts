import mongoose from "mongoose";
import { envConfig } from "../config/env.config"; // 引用最新的配置
import { logger } from "../../shared/utils/logger.util"; // 引用最新的日志工具

const MAX_RETRY = 5;
const RETRY_INTERVAL = 3000;

/**
 * 数据库连接核心函数
 * 职责：建立连接、失败重试、配置 Mongoose 全局参数
 */
export const connectDatabase = async (retryCount = 0): Promise<void> => {
  const { uri, dbName } = envConfig.mongo;

  try {
    // 1. 设置 Mongoose 严格模式 (推荐)
    mongoose.set("strictQuery", true);

    // 2. 建立连接
    await mongoose.connect(uri, {
      dbName: dbName,
      // 生产环境建议设置连接池，防止高并发下连接耗尽
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ [MongoDB] Connection successful to database: ${dbName}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(
      `❌ [MongoDB] Connection failed (Attempt ${
        retryCount + 1
      }/${MAX_RETRY}): ${errorMsg}`
    );

    // 3. 重试逻辑
    if (retryCount < MAX_RETRY) {
      logger.warn(`🔁 [MongoDB] Retrying in ${RETRY_INTERVAL / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDatabase(retryCount + 1);
    }

    // 4. 致命错误处理
    logger.error(
      "🚨 [MongoDB] Max retries reached. Orchestrator cannot start. Exiting..."
    );
    process.exit(1);
  }
};

// ========================
// 🔌 Mongoose 全局事件监听
// ========================

mongoose.connection.on("disconnected", () => {
  // 非程序主动断开时发出警告
  logger.warn("⚠️ [MongoDB] Disconnected!");
});

mongoose.connection.on("error", (err) => {
  logger.error(`❌ [MongoDB] Internal error: ${err}`);
});

// ========================
// 🛑 优雅退出处理
// ========================
// 监听 Ctrl+C 或 Docker 停止信号
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    logger.info("🛑 [MongoDB] Connection closed through app termination");
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});
