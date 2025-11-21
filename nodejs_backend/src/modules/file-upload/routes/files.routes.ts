// src/modules/files/router/file.router.ts (优化后)

import { Router } from "express";
import { fileController } from "../controllers/files.controller"; // 确保导入路径和名称正确
import { upload } from "../utils/upload.util"; // Multer 上传工具
// 导入校验中间件
import { validateFileMetadata } from "../utils/validateFileMetadata.util";

const fileRouter = Router();

// -----------------------------------------------------------
// 文件元数据管理 (CRUD)
// -----------------------------------------------------------

// 创建文件元数据 (POST /)
// ✅ 优化点：使用校验中间件确保请求体符合 CreateFileDTO
fileRouter.post("/", validateFileMetadata, fileController.createFile);

// 获取文件列表 (GET /)
fileRouter.get("/", fileController.getAllFiles);

// 获取单个文件 (GET /:id)
fileRouter.get("/:id", fileController.getFileById);

// 更新文件元数据 (PUT /:id)
// ✅ 优化点：复用校验中间件 (如果它支持宽松的 UpdateFileDTO 校验)
fileRouter.put(
  "/:id",
  validateFileMetadata, // 假设此中间件可用于更新校验
  fileController.updateFile
);

// 删除文件 (DELETE /:id)
fileRouter.delete("/:id", fileController.deleteFile);

// -----------------------------------------------------------
// 文件上传
// -----------------------------------------------------------

// 上传文件 (POST /upload)
// Multer 将文件保存到本地，然后 Controller 调用 FileValidator 和 Service
fileRouter.post(
  "/upload",
  upload.single("file"), // Multer 中间件
  fileController.uploadFile
);

export { fileRouter };
