import mongoose from "mongoose";

export const connectDB = async () => {
  const { MONGODB_URL, MONGODB_DB_NAME } = process.env;
  try {
    if (!MONGODB_URL) {
      throw new Error("❌ 未检测到MongoDB数据库URL，请检查.env文件配置。");
    } else {
      await mongoose.connect(MONGODB_URL, {
        dbName: MONGODB_DB_NAME || "data_v_platform",
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB 已连接:${mongoose.connection.name}`);
      console.log(`📦 数据库地址：${MONGODB_URL}`);
    }
  } catch (error) {
    console.log("❌ 数据库连接失败，错误信息：", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("🔌 Mongoose 连接已建立");
});

mongoose.connection.on("error", (error) => {
  console.error("⚠️ Mongoose 连接出错:", error);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose 连接断开");
});
