// modules/files/repository/file.repository.ts
import { File } from "../models/File.model";
import { CreateFileDTO } from "../dto/createFile.dto";
import { UpdateFileDTO } from "../dto/updateFile.dto";

export const fileRepository = {
  /** 创建文件记录 */
  async create(data: CreateFileDTO) {
    const file = new File(data);
    return file.save();
  },

  /** 获取分页文件列表 */
  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    return File.find()
      .select("-__v -updatedAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  /** 统计文件数量 */
  async count(filter = {}) {
    if (Object.keys(filter).length > 0) {
      return File.countDocuments(filter);
    }
    return File.estimatedDocumentCount();
  },

  /** 根据 ID 获取文件 */
  async findById(id: string) {
    return File.findById(id);
  },

  /** 更新文件 */
  async updateById(id: string, updates: UpdateFileDTO) {
    return File.findByIdAndUpdate(id, updates, { new: true });
  },

  /** 删除文件（仅 MongoDB，不删物理文件） */
  async deleteById(id: string) {
    return File.findByIdAndDelete(id);
  },
};
