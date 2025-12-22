import { bootstrapApplication } from "./core/bootstrap.core";
import { createApp } from "./app";
import { envConfig } from "./config/env.config";
import { logger } from "../shared/utils/logger.util";

/**
 * 程序主入口
 * 职责：启动引导程序 -> 创建 App 实例 -> 监听端口
 */
const startServer = async () => {
  try {
    // 1. 执行系统引导 (连接 DB, Redis, 创建目录)
    await bootstrapApplication();

    // 2. 创建 Express 应用实例
    const app = createApp();
    const { port, apiPrefix, env } = envConfig.app;

    // 3. 启动 HTTP 服务器
    const server = app.listen(port, () => {
      logger.info(`=================================`);
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`🛠  Environment: ${env}`);
      logger.info(`🔗 Base URL: http://localhost:${port}${apiPrefix}`);
      logger.info(`=================================`);
    });

    // 4. 优雅停机处理 (Graceful Shutdown)
    // 当 Docker 或 PM2 发送停止信号时，先关闭 HTTP 服务器，不再接收新请求
    const gracefulShutdown = () => {
      logger.info("🛑 SIGTERM received. Shutting down HTTP server...");
      server.close(() => {
        logger.info("🛑 HTTP server closed.");
        // 这里可以添加 db.disconnect() 等逻辑，
        // 但我们在 database.ts 中已经监听了 SIGINT，此处只需退出进程
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    // 启动阶段的致命错误 (如 bootstrap 失败)
    logger.error("🚨 Fatal error during startup:", error);
    process.exit(1);
  }
};

// 启动
startServer();
