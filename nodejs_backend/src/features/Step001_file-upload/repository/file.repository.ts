import { FilterQuery, UpdateQuery } from "mongoose";
import { FileModel, IFileDocument, IFile } from "../models/File.model"; // 注意路径匹配
import { CreateFileServiceDTO, UpdateFileDTO } from "../dto/file.dto";
import { PaginationQuery } from "../../../shared/types/pagination.type"; // 假设路径

// 定义通用的分页返回结构 (建议放到 shared/types 中，这里暂时写在这里方便看)
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const fileRepository = {
  /**
   * 创建文件记录
   */
  async create(data: CreateFileServiceDTO): Promise<IFileDocument> {
    const file = new FileModel({
      ...data,
      isDeleted: false, // 显式初始化
      stage: "uploaded",
    });
    return file.save();
  },

  /**
   * ⭐️ 核心升级：支持过滤 + 分页 + 返回总数 + 默认排除软删除
   * @param query 分页参数
   * @param filter 额外的过滤条件 (如 userId)
   */
  async findAll(
    query: PaginationQuery,
    filter: FilterQuery<IFileDocument> = {}
  ): Promise<PaginatedResult<IFile>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      order = "desc",
    } = query;
    const skip = (page - 1) * pageSize;

    // 1. 强制合并：排除已删除的文件
    const finalFilter = { ...filter, isDeleted: false };

    // 2. 并行执行：查询数据 + 统计总数 (提升效率)
    const [items, total] = await Promise.all([
      FileModel.find(finalFilter)
        .select("-__v -analysisResult") // 列表页通常不需要巨大的分析结果，节省流量
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .lean<IFile[]>(), // 泛型提示，返回纯对象
      FileModel.countDocuments(finalFilter),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  },

  /**
   * 根据 ID 获取详情
   * 注意：详情页可能需要看到 analysisResult
   */
  async findById(id: string): Promise<IFileDocument | null> {
    return FileModel.findOne({ _id: id, isDeleted: false });
  },

  /**
   * ⭐️ 新增：根据 Hash 查找文件 (用于秒传)
   * 查找系统中是否存在相同内容且未删除的文件
   */
  async findByHash(hash: string): Promise<IFileDocument | null> {
    return FileModel.findOne({ hash, isDeleted: false });
  },

  /**
   * 根据 FastAPI ID 查找
   */
  async findByFastApiId(fastApiFileId: string): Promise<IFileDocument | null> {
    return FileModel.findOne({ fastApiFileId, isDeleted: false });
  },

  /**
   * 更新文件
   */
  async updateById(
    id: string,
    updates: UpdateQuery<IFileDocument> // 使用 Mongoose 的 UpdateQuery 类型更安全
  ): Promise<IFileDocument | null> {
    return FileModel.findOneAndUpdate(
      { _id: id, isDeleted: false }, // 确保不更新已删除的文件
      updates,
      { new: true }
    );
  },

  /**
   * ⭐️ 软删除 (Soft Delete)
   * 实际上是更新操作
   */
  async deleteById(id: string): Promise<IFileDocument | null> {
    return FileModel.findOneAndUpdate(
      { _id: id },
      {
        isDeleted: true,
        stage: "failed", // 或者保留原状态，视业务需求而定，这里标记删除
      },
      { new: true }
    );
  },

  /**
   * 物理删除 (仅用于管理员清理或磁盘空间不足时)
   */
  async hardDeleteById(id: string): Promise<IFileDocument | null> {
    return FileModel.findByIdAndDelete(id);
  },
};
