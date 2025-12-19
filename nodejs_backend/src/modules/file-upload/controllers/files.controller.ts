// src/modules/files/controllers/file.controller.ts (优化后)

import { Request, Response, NextFunction } from "express";
import { fileService } from "../services/file.service.js";
import { sendResponse } from "../../../shared/utils/response.util.js";
import { CreateFileDTO } from "../dto/createFile.dto.js";
import { QualityService } from "../../quality/services/quality.services.js";

// 导入共享工具和类型
import { FileValidator } from "../../../shared/validators/file.Validator.js"; // ✅ 导入校验器
import { ValidationException } from "../../../shared/exceptions/validation.exception.js"; // ✅ 导入校验异常
import { PaginationQuery } from "../../../shared/types/paginationQuery.type.js"; // ✅ 导入分页查询类型

export const fileController = {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. 强制文件校验 (使用共享工具)
      // ⚠️ 如果 Multer 已经捕获了文件大小错误，错误会在 next(err) 中被处理
      FileValidator.validateAll(req.file); // 检查文件是否存在、大小和类型
      const file = req.file!; // 断言文件存在 // 2. 构造 DTO (使用 Multer 和 Service 提供的元数据)
      const fileData: CreateFileDTO = {
        name: file.originalname,
        storedName: file.filename,
        path: file.path.replace(/\\/g, "/"),
        size: file.size,
        type: file.mimetype.split("/")[0],
      }; // 3. 保存到 MongoDB

      const savedFile = await fileService.createFile(fileData); // 4. 异步触发解析 (假设您希望立即解析) // 不阻塞响应，但需要在 Service 中处理解析失败的异常

      fileService
        .parseAndSaveMetadata(savedFile._id.toString())
        .catch((parseErr) => {
          // 使用 Logger 记录异步操作的错误
          console.error(
            "Async parsing failed for file:",
            savedFile._id,
            parseErr
          );
        }); // 5. 发送响应 (使用共享工具 sendResponse)

      return sendResponse(res, 201, "文件上传成功并开始解析", savedFile); // 状态码改为 201 Created
    } catch (error) {
      next(error);
    }
  },

  async createFile(req: Request, res: Response, next: NextFunction) {
    // ⚠️ 假设这里已经有 validateFileMetadataMiddleware 校验了 req.body
    try {
      const data: CreateFileDTO = req.body;
      const newFile = await fileService.createFile(data);
      return sendResponse(res, 201, "创建文件元数据成功", newFile);
    } catch (error) {
      next(error);
    }
  },

  async getAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. 整合分页查询参数 (使用共享类型)
      const query: PaginationQuery = {
        page: parseInt(req.query.page as string),
        pageSize: parseInt(req.query.limit as string), // 使用 limit 字段作为 pageSize // 可以在这里添加 sortBy, order, filter 等其他查询参数
      }; // 2. 调用 Service (Service 返回 PaginatedResult 结构)
      const result = await fileService.getAllFiles(query); // 3. 发送响应 (直接返回 Service 封装好的 PaginatedResult)
      return sendResponse(res, 200, "获取文件列表成功", result);
    } catch (error) {
      next(error);
    }
  },

  async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Service 层将处理 404 逻辑 (抛出 FileNotFoundException)
      const file = await fileService.getFileById(id); // ⚠️ 移除手动 404 检查
      return sendResponse(res, 200, "获取文件成功", file);
    } catch (error) {
      next(error);
    }
  },

  async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates: Partial<CreateFileDTO> = req.body; // Service 层将处理 404 逻辑
      const updatedFile = await fileService.updateFile(id, updates); // ⚠️ 移除手动 404 检查
      return sendResponse(res, 200, "更新文件成功", updatedFile);
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Service 层将处理 404 逻辑，并删除物理文件
      const deletedFile = await fileService.deleteFile(id); // ⚠️ 移除手动 404 检查
      return sendResponse(res, 200, "删除文件成功", deletedFile);
    } catch (error) {
      next(error);
    }
  },
};
