import { Request, Response, NextFunction } from "express";
import path from "path";
import { fileService } from "../services/file.service";
import { responseUtils } from "../../../shared/utils/response.util";
import { CreateFileServiceDTO } from "../dto/file.dto";
import { ValidationException } from "../../../shared/exceptions/validation.exception";
import { PaginationQuery } from "../../../shared/types/pagination.type";

export const fileController = {
  /**
   * 上传文件主入口
   * 流程：
   * 1. Multer 接收文件并落盘
   * 2. 组装 DTO
   * 3. Service 处理 (计算Hash -> 秒传检测 -> 入库 -> 🚀异步触发分析)
   * 4. 立即返回响应 (前端无需等待分析完成)
   */
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. 基础校验
      if (!req.file) {
        throw new ValidationException([
          {
            field: "file",
            message: "File is required or format not supported.",
          },
        ]);
      }

      const file = req.file;

      // 2. 组装 DTO
      const fileData: CreateFileServiceDTO = {
        name: Buffer.from(file.originalname, "latin1").toString("utf8"), // 中文名修复
        storedName: file.filename,
        path: file.path.replace(/\\/g, "/"), // Windows 路径兼容
        size: file.size,
        mimetype: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        // userId: req.user?.id // 如果有鉴权
      };

      // 3. 调用业务逻辑
      // processUpload 内部会自动调用 qualityService.startAnalysis(newFile)
      // 并且使用了 .catch() 来确保不会阻塞当前线程，实现"Fire and Forget"
      const result = await fileService.processUpload(fileData);

      // 4. 立即返回
      // ⚠️ 修复：responseUtils.created 的参数顺序是 (res, data, message)
      // 你原本的代码传的是 (res, fileData, msg)，但 result 包含了 _id，这才是前端需要的
      return responseUtils.created(res, result, "文件上传成功，后台分析已启动");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取文件列表
   */
  async getAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize
          ? parseInt(req.query.pageSize as string)
          : 10,
        sortBy: (req.query.sortBy as string) || "createdAt",
        order: (req.query.order as "asc" | "desc") || "desc",
      };

      const result = await fileService.getAllFiles(query);

      // ⚠️ 修复：responseUtils.success 需要传入 data
      // 原代码：responseUtils.success(res, 200, "msg") -> 错误的参数
      // 正确：responseUtils.success(res, result, "msg")
      return responseUtils.success(res, result, "获取文件列表成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取详情
   */
  async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);

      // ⚠️ 修复：传入 file 数据
      return responseUtils.success(res, file, "获取文件详情成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 更新文件
   */
  async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedFile = await fileService.updateFile(id, updates); // 假设 Service 有这个方法

      // ⚠️ 修复：传入 updatedFile
      return responseUtils.success(res, updatedFile, "更新文件成功");
    } catch (error) {
      next(error);
    }
  },

  /**
   * 删除文件
   */
  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedFile = await fileService.deleteFile(id);

      // ⚠️ 修复：传入 deletedFile 或 null
      return responseUtils.success(res, deletedFile, "删除文件成功");
    } catch (error) {
      next(error);
    }
  },
};
