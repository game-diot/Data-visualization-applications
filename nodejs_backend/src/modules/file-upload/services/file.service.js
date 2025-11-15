import { File } from "../models/File.model.js";

export const fileService = {
  async createFile(data) {
    const file = new File(data);
    return await file.save();
  },

  async getAllFiles({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    return await File.find()
      .select("-__v -updatedAt") // 过滤无用字段
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async countFiles(filter = {}) {
    // 使用 countDocuments 更精确，或者 estimatedDocumentCount 更快（无 filter）
    if (Object.keys(filter).length) {
      return await File.countDocuments(filter);
    }
    return await File.estimatedDocumentCount();
  },

  async getFileById(id) {
    return await File.findById(id);
  },

  async updateFile(id, updates) {
    return await File.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteFile(id) {
    // findByIdAndDelete 会返回被删除的文档（或 null）
    const deletedFile = await File.findByIdAndDelete(id);
    if (!deletedFile) return null;

    // 删除物理文件
    try {
      await fs.unlink(deletedFile.path);
    } catch (err) {
      console.warn(
        `[deleteFile] File not found or already deleted: ${deletedFile.path}`
      );
    }

    return deletedFile;
  },
};
