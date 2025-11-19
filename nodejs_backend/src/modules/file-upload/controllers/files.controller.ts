// modules/files/controllers/file.controller.ts
import { Request, Response, NextFunction } from "express";
import { fileService } from "../services/file.service.js";
import { sendResponse } from "../../../shared/utils/response.util.js";
import { CreateFileDTO } from "../dto/createFile.dto.js";

export const fileController = {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return sendResponse(res, 400, "未检测到文件");

      const file = req.file;
      const fileData: CreateFileDTO = {
        name: file.originalname,
        storedName: file.filename,
        path: file.path.replace(/\\/g, "/"),
        size: file.size,
        type: file.mimetype.split("/")[0],
        totalRows: 0,
        totalCols: 0,
        stage: "uploaded",
      };

      // 保存到 MongoDB
      const savedFile = await fileService.createFile(fileData);
      const fileId = savedFile._id.toString();

      sendResponse(res, 200, "文件上传成功", {
        meta: {
          ...fileData,
          id: fileId,
        },
        previewRows: [],
      });

      // 异步触发分析服务，可在此处调用 qualityService.triggerAnalysis(fileId, savedFile.path)
    } catch (error) {
      next(error);
    }
  },

  async createFile(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateFileDTO = req.body;
      const newFile = await fileService.createFile(data);
      return sendResponse(res, 200, "创建文件成功", newFile);
    } catch (error) {
      next(error);
    }
  },

  async getAllFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const files = await fileService.getAllFiles({ page, limit });
      const total = await fileService.countFiles();

      return sendResponse(res, 200, "获取文件列表成功", {
        total,
        page,
        limit,
        records: files,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);
      if (!file) return sendResponse(res, 404, "File not found");
      return sendResponse(res, 200, "获取文件成功", file);
    } catch (error) {
      next(error);
    }
  },

  async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates: Partial<CreateFileDTO> = req.body;
      const updatedFile = await fileService.updateFile(id, updates);
      if (!updatedFile) return sendResponse(res, 404, "File not found");
      return sendResponse(res, 200, "更新文件成功", updatedFile);
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedFile = await fileService.deleteFile(id);
      if (!deletedFile) return sendResponse(res, 404, "File not found");
      return sendResponse(res, 200, "删除文件成功", deletedFile);
    } catch (error) {
      next(error);
    }
  },
};
