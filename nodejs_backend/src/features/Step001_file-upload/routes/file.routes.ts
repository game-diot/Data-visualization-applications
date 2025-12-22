import { Router } from "express";
// ⚠️ 注意：之前的步骤中我们文件名是 file.controller.ts (单数)
import { fileController } from "../controllers/file.controller";
import { upload } from "../utils/upload.util"; // Multer 配置

const fileRouter = Router();

// ==============================================================================
// 1. 核心功能：文件上传 (The "Create" Action)
// ==============================================================================

/**
 * POST /api/files/upload
 * 流程：
 * 1. upload.single("file"): Multer 拦截请求 -> 存入 uploadFiles 目录 -> 挂载 req.file
 * 2. fileController.uploadFile: 校验 req.file -> 组装 DTO -> 调用 Service (秒传/入库/分析)
 */
fileRouter.post("/upload", upload.single("file"), fileController.uploadFile);

// ==============================================================================
// 2. 查询与管理 (Query & Management)
// ==============================================================================

/**
 * GET /api/files
 * 获取文件列表 (支持分页 ?page=1&pageSize=10)
 */
fileRouter.get("/", fileController.getAllFiles);

/**
 * GET /api/files/:id
 * 获取单个文件详情 (包含分析状态)
 */
fileRouter.get("/:id", fileController.getFileById);

/**
 * PUT /api/files/:id
 * 更新文件信息 (如重命名、备注)
 * ⚠️ 注意：这里去掉了 validateFileMetadata，因为更新时不需要 path/size 等字段
 */
fileRouter.put("/:id", fileController.updateFile);

/**
 * DELETE /api/files/:id
 * 删除文件 (软删除 + 物理清理)
 */
fileRouter.delete("/:id", fileController.deleteFile);

export { fileRouter };
