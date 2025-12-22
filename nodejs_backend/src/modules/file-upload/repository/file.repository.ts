// 确保导入路径与您实际项目结构匹配
import { FileModel, IFileDocument, IFile } from "../models/File.model";
import { CreateFileDTO } from "../dto/createFile.dto.js"; // 假设 DTO 路径
import { PaginationQuery } from "../../../shared/types/pagination.type.js";
import { UpdateFileDTO } from "../dto/updateFile.dto.js";

export const fileRepository = {
  /**    * 创建文件记录
   * @param data - 包含文件初始元数据和状态的 DTO
   */
  async create(data: CreateFileDTO): Promise<IFileDocument> {
    const file = new FileModel(data);
    return file.save();
  },
  /**    * 获取分页文件列表 (使用 .lean() 提高查询性能)
   * @returns 返回纯数据对象数组 (IFile)
   */ async findAll(query: PaginationQuery): Promise<IFile[]> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      order = "desc",
    } = query;

    const skip = (page - 1) * pageSize;

    return FileModel.find()
      .select("-__v") // 移除 __v 字段
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(pageSize)
      .lean() as Promise<IFile[]>;
  } /** 统计文件数量 */,

  async count(filter = {}): Promise<number> {
    return FileModel.countDocuments(filter);
  },
  /**    * 根据内部 ID 获取文件 (返回带 Mongoose 方法的 Document)
   * @param id - MongoDB 文档 ID
   */ async findById(id: string): Promise<IFileDocument | null> {
    return FileModel.findById(id);
  },
  /**    * ⭐️ 新增: 根据 FastAPI 外部 ID 获取文件
   * @param fastApiFileId - FastAPI 服务中对应的文件 ID
   */ async findByFastApiId(
    fastApiFileId: string
  ): Promise<IFileDocument | null> {
    return FileModel.findOne({ fastApiFileId });
  },
  /**    * 根据 ID 更新文件
   * @param id - MongoDB 文档 ID
   * @param updates - 需要更新的字段
   */ async updateById(
    id: string,
    updates: UpdateFileDTO
  ): Promise<IFileDocument | null> {
    // new: true 确保返回更新后的文档
    return FileModel.findByIdAndUpdate(id, updates, { new: true });
  },
  /**    * 删除文件记录（仅 MongoDB）
   * @param id - MongoDB 文档 ID
   */ async deleteById(id: string): Promise<IFileDocument | null> {
    return FileModel.findByIdAndDelete(id);
  },
};
