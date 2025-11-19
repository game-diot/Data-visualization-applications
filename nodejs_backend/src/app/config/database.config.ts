// src/config/mongo.config.ts
import mongoose from "mongoose";
import { config } from "./env.config";
const MAX_RETRY = 5;

export const connectDB = async (retry = 0): Promise<void> => {
  const MONGODB_URL = config.mongoUri; // ✅ 使用导入的配置对象
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME; // 或者也从 config 导出

  if (!MONGODB_URL) {
    console.error("❌ 未检测到 MONGODB_URL，请检查 .env 配置。");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URL, {
      dbName: MONGODB_DB_NAME || "data_v_platform",
    });

    console.log(`✅ MongoDB 已连接：${mongoose.connection.name}`);
    console.log(`📦 连接地址：${MONGODB_URL}`);
  } catch (error) {
    console.error(`❌ 第 ${retry + 1} 次连接失败:`, error);

    if (retry < MAX_RETRY) {
      console.log("🔁 3 秒后重试...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return connectDB(retry + 1);
    }

    console.error("🚨 达到最大重试次数，退出程序");
    process.exit(1);
  }
};

// ========================
// 🔌 Mongoose 状态监听
// ========================

mongoose.connection.on("connected", () => {
  console.log("🔌 Mongoose: 已建立连接");
});

mongoose.connection.on("error", (err) => {
  console.error("⚠️ Mongoose: 连接错误:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose: 连接已断开");
});
