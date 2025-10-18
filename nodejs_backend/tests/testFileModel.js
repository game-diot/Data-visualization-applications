// backend/tests/testFileService.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/database/connection.js";
import { fileService } from "../src/modules/files/services/file.service.js";

dotenv.config({ path: ".env.development" });

const runServiceTest = async () => {
  try {
    await connectDB();
    console.log("✅ 数据库连接成功，开始测试 fileService...\n");

    // 1️⃣ 创建文件
    const createdFile = await fileService.createFile({
      originName: "user_upload_data.csv",
      storedName: "user_upload_data_abc123.csv",
      path: "uploads/2025-10-14/user_upload_data_abc123.csv",
      size: 12800,
      type: "csv",
      format: "text/csv",
      description: "测试 fileService 的创建功能",
    });
    console.log("✅ 文件创建成功：", createdFile);

    // 2️⃣ 获取所有文件
    const files = await fileService.getAllFiles();
    console.log("\n📂 当前数据库文件：", files);

    // 3️⃣ 更新文件
    const updated = await fileService.updateFile(createdFile._id, {
      status: "parsed",
      description: "文件已解析完成",
    });
    console.log("\n🔄 更新文件：", updated);

    // 4️⃣ 删除文件
    const deleted = await fileService.deleteFile(createdFile._id);
    console.log("\n🗑 删除文件：", deleted);
  } catch (error) {
    console.error("❌ 测试失败：", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 数据库连接已关闭。");
  }
};

runServiceTest();
