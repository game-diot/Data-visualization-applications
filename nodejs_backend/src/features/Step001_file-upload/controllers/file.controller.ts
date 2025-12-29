import { Request, Response, NextFunction } from "express";
import path from "path"; // 需要引入 path 处理扩展名
import { fileService } from "../services/file.service"; // 确保路径正确
import { responseUtils } from "../../../shared/utils/response.util";
import { CreateFileServiceDTO } from "../dto/file.dto"; // ⚠️ 注意使用 Service 层的 DTO
import { ValidationException } from "../../../shared/exceptions/validation.exception";
import { PaginationQuery } from "../../../shared/types/pagination.type";

export const fileController = {
  /**
   * 上传文件主入口
   * 处理逻辑：Multer落盘 -> 组装DTO -> Service(Hash/秒传/入库/触发分析)
   */
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. 基础校验：确保 Multer 已经工作
      if (!req.file) {
        throw new ValidationException([
          {
            field: "file",
            message: "File is required or format not supported.",
          },
        ]);
      }

      const file = req.file;

      // 2. 组装 Service 需要的 DTO
      // 注意：这里不需要再调用 FileValidator，因为 Multer 的 fileFilter 已经过滤过了
      const fileData: CreateFileServiceDTO = {
        name: Buffer.from(file.originalname, "latin1").toString("utf8"), // 修复中文乱码(视情况而定)
        storedName: file.filename,
        path: file.path.replace(/\\/g, "/"), // 兼容 Windows 路径
        size: file.size,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        // 如果你有用户系统: userId: req.user?.id
      };

      // 3. 调用核心业务逻辑 (包含秒传和触发 Python 分析)
      // ⚠️ 关键改变：使用 processUpload 而不是 create
      const result = await fileService.processUpload(fileData);

      // 4. 返回响应
      // 注意：这里返回 201 Created，且包含了可能来自“秒传”的旧文件数据
      return responseUtils.created(
        res,
        fileData,
        "文件上传成功，后台分析已启动"
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取文件列表 (支持分页)
   */
  async getAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. 解析分页参数 (确保是数字)
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string)
          : 10,
        sortBy: (req.query.sortBy as string) || "createdAt",
        order: (req.query.order as "asc" | "desc") || "desc",
      };

      // 2. 调用 Service
      const result = await fileService.getAllFiles(query);

      // 3. 返回结果
      return responseUtils.success(res, 200, "获取文件列表成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取单个文件详情
   */
  async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);
      return responseUtils.success(res, 200, "获取文件详情成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 更新文件信息 (通常用于更新备注或手动修正状态)
   */
  async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body; // 注意：这里可以使用 Joi 校验 body
      const updatedFile = await fileService.updateFile(id, updates);
      return responseUtils.success(res, 200, "更新文件成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 删除文件 (软删除)
   */
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedFile = await fileService.deleteFile(id);
      return responseUtils.success(res, 200, "删除文件成功");
    } catch (error) {
      next(error);
    }
  },
};
