// modules/files/router/file.router.ts
import { Router } from "express";
import { fileController } from "../controllers/files.controller";
import { upload } from "../utils/upload.util"; // 使用统一 core 目录的上传工具
// import { validateFile } from "../../../shared/middleware/validation.middleware.js";

const fileRouter = Router();

// 创建文件
fileRouter.post("/", fileController.createFile);

// 获取文件列表
fileRouter.get("/", fileController.getAllFiles);

// 获取单个文件
fileRouter.get("/:id", fileController.getFileById);

// 更新文件
fileRouter.put("/:id", fileController.updateFile);

// 删除文件
fileRouter.delete("/:id", fileController.deleteFile);

// 上传文件
fileRouter.post("/upload", upload.single("file"), fileController.uploadFile);

export { fileRouter };
