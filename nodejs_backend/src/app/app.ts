import express, { Application } from "express";
import { envConfig } from "./config/env.config";

// 导入路由入口
import routes from "./routes/api.routes";

// 导入中间件
import { requestLogger } from "./middleware/requestLogger.middleware";
import { corsMiddleware } from "./middleware/cors.middleware";
import { createRateLimiter } from "./middleware/rate-limit.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

/**
 * Express 应用工厂函数
 * 职责：组装中间件、路由和配置，返回一个待启动的 App 实例
 */
export const createApp = (): Application => {
  const app = express();

  // 1. 代理信任设置 (非常重要！)
  // 如果你的应用跑在 Nginx 或 Docker 负载均衡后，必须开启此项，
  // 否则 req.ip 永远是 127.0.0.1，会导致限流失效。
  if (envConfig.app.isProd) {
    app.set("trust proxy", 1);
  }

  // 2. 基础中间件 (日志 & 跨域)
  app.use(requestLogger);
  app.use(corsMiddleware);

  // 3. 安全中间件 (限流)
  // 放在 BodyParser 之前，防止攻击者发送大包消耗服务器资源
  app.use(createRateLimiter());

  // 4. 数据解析中间件
  // 限制 Payload 大小，防止 DoS 攻击
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 5. 挂载业务路由
  // 使用配置中的前缀，通常是 /api/v1
  app.use(envConfig.app.apiPrefix, routes);

  // =========================================================
  // ⚠️ 警告：以下两个中间件必须放在所有路由之后
  // =========================================================

  // 6. 404 处理 (未匹配到任何路由)
  app.use(notFoundMiddleware);

  // 7. 全局错误处理 (最后一道防线)
  app.use(errorMiddleware);

  return app;
};
