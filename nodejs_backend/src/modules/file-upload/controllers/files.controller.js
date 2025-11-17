import { fileService } from "../services/file.service.js";
import { response } from "../../../shared/utils/response.util.js";

export const fileController = {
  // controllers/files.controller.js
  async uploadFile(req, res, next) {
    try {
      if (!req.file) return response(res, 400, "未检测到文件");

      const file = req.file;
      const fileData = {
        name: file.originalname,
        storedName: file.filename,
        path: file.path.replace(/\\/g, "/"),
        size: file.size,
        type: file.mimetype.split("/")[0],
        totalRows: 0,
        totalCols: 0,
        uploadTime: new Date(),
        stage: "uploaded",
      };

      // 1. 保存到 MongoDB
      const savedFile = await fileService.createFile(fileData);
      const fileId = savedFile._id.toString(); // ✅ MongoDB _id

      // 2. 立即返回响应
      response(res, 200, "文件上传成功", {
        meta: {
          ...fileData,
          id: fileId, // ✅ 返回 MongoDB _id
        },
        previewRows: [],
      });

      // // 3. 异步触发 FastAPI 分析（传递 MongoDB _id）
      // qualityService
      //   .triggerAnalysis(fileId, savedFile.path)
      //   .catch((err) => logger.error("Analysis failed", err));
    } catch (error) {
      next(error);
    }
  },

  async createFile(req, res, next) {
    try {
      const data = req.body;
      const newFile = await fileService.createFile(data);
      return response(res, 200, "创建文件成功。", newFile);
    } catch (error) {
      next(error);
    }
  },

  // controllers/files.controller.js
  async getAllFiles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const files = await fileService.getAllFiles({ page, limit });
      const total = await fileService.countFiles(); // <- 从 service 调用

      return response(res, 200, "获取文件列表成功。", {
        total,
        page,
        limit,
        records: files,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFileById(req, res, next) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);
      if (!file) {
        return response(res, 404, "Flie not found");
      } else {
        return response(res, 200, "获取文件成功。", file);
      }
    } catch (error) {
      next(Error);
    }
  },

  async updateFile(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updateFile = await fileService.updateFile(id, updates);

      if (!updateFile) {
        return response(res, 404, "File not found");
      } else {
        return response(res, 200, "更新文件成功。", updateFile);
      }
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const deleteFile = await fileService.deleteFile(id);
      if (!deleteFile) {
        return response(res, 404, "File not found");
      } else {
        return response(res, 200, "File deleted successfully");
      }
    } catch (error) {
      next(error);
    }
  },
};
