import { envConfig } from "../config/env.config";
import { connectDatabase } from "./database";
import { initRedis } from "../../infrastructure/cache/redis.client";
import { fileUtils } from "../../shared/utils/file.utils";
import { logger } from "../../shared/utils/logger.util";

/**
 * 系统启动引导程序 (Bootstrapper)
 * 职责：按依赖顺序初始化所有基础设施，是 main.ts 的前置条件
 */
export const bootstrapApplication = async (): Promise<void> => {
  logger.info("🚀 [Bootstrap] System initialization started...");

  // 1. 打印关键环境信息 (保留你的调试习惯)
  logger.info(`✨ [Config] Environment: ${envConfig.app.env}`);
  logger.info(`🔌 [Config] Database: ${envConfig.mongo.dbName}`);
  logger.info(`🔌 [Config] Redis: ${envConfig.redis.url}`);

  try {
    // 2. 初始化核心目录 (Uploads, Temp)
    // 依赖 file.utils.ts 的异步能力
    await fileUtils.ensureDirectories();
    logger.info("📂 [FileSystem] Core directories verified.");

    // 3. 连接 MongoDB
    // 数据库是核心资产，必须优先连接
    await connectDatabase();

    // 4. 连接 Redis
    // 基础设施层连接，注意：这里调用的是 redis.client 而不是 cacheManager
    await initRedis();

    logger.info("✅ [Bootstrap] All systems operational. Ready to lift off!");
  } catch (error) {
    logger.error(
      "🚨 [Bootstrap] System initialization failed. Exiting process."
    );
    // 打印具体错误堆栈，方便排查
    if (error instanceof Error) {
      logger.error(error.stack || error.message);
    }
    // 致命错误，必须退出
    process.exit(1);
  }
};
