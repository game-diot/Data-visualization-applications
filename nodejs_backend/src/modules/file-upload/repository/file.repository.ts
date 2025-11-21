// src/modules/files/repository/file.repository.ts (优化后)

import { File, IFileDocument } from "../models/File.model";
import { CreateFileDTO } from "../dto/createFile.dto";
import { UpdateFileDTO } from "../dto/updateFile.dto";
import { PaginationQuery } from "../../../shared/types/paginationQuery.type"; // 确保路径正确

export const fileRepository = {
  /** 创建文件记录 */
  async create(data: CreateFileDTO) {
    const file = new File(data);
    return file.save();
  },
  /**    * ✅ 优化点: 接收 PaginationQuery 对象
   * 获取分页文件列表
   */ async findAll(query: PaginationQuery): Promise<IFileDocument[]> {
    // 1. 解构并应用默认值 (如果Service层未处理)
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt", // 使用Model字段作为默认排序键
      order = "desc",
    } = query;

    const skip = (page - 1) * pageSize;

    return File.find()
      .select("-__v -updatedAt")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 }) // 应用动态排序
      .skip(skip)
      .limit(pageSize)
      .lean();
  } /** 统计文件数量 */,

  async count(filter = {}) {
    if (Object.keys(filter).length > 0) {
      return File.countDocuments(filter);
    } // 优化：使用 countDocuments() 而非 estimatedDocumentCount() // 因为 estimatedDocumentCount() 在 MongoDB 中可能返回不准确的近似值，countDocuments() 总是准确的。
    return File.countDocuments({});
  } /** 根据 ID 获取文件 */,

  async findById(id: string) {
    return File.findById(id);
  } /** 更新文件 */,

  async updateById(id: string, updates: UpdateFileDTO) {
    return File.findByIdAndUpdate(id, updates, { new: true });
  } /** 删除文件（仅 MongoDB，不删物理文件） */,

  async deleteById(id: string) {
    return File.findByIdAndDelete(id);
  },
};
