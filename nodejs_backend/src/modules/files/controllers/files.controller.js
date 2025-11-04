import { fileService } from "../services/file.service.js";
import { response } from "../../../shared/utils/response.util.js";

export const fileController = {
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return response(res, 400, "未检测到文件");
      } else {
        const file = req.file;
        const filedData = {
          originName: file.originalname,
          storedName: file.filename,
          path: file.path.replace(/\\/g, "/"), // 兼容Windows路径
          size: file.size,
          type: file.mimetype.split("/")[0], // 比如 "text"、"application"
          format: file.mimetype, // 比如 "text/csv"
          uploadTime: new Date(),
          status: "uploaded",
          description: req.body.description || "",
          tags: req.body.tags ? req.body.tags.split(",") : [],
        };

        const savedFile = await fileService.createFile(filedData);
        return response(res, 200, "文件上传成功。", savedFile);
      }
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

  async getAllFiles(req, res, next) {
    try {
      const files = await fileService.getAllFiles();
      return response(res, 200, "获取文件列表成功。", files);
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
