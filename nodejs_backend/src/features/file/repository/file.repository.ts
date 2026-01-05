import { FilterQuery, UpdateQuery } from "mongoose";
// 1. 引入上一轮定义的 Model 和 Interface
import { FileModel } from "../models/file.model";
import { IFile } from "../models/interface/ifile.interface";
// 2. 引入 DTO
import {
  CreateFileServiceDTO,
  UpdateFileServiceDTO,
} from "../dto/fileService.dto";
// 3. 引入常量 (严禁硬编码)
import { FILE_STAGE_ENUM } from "../constant/file-stage.constant";

// 假设放在 shared 中，这里为了完整性保留
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

/**
 * File Repository
 * 职责：只负责数据库的原子操作 (CRUD)，不含任何业务逻辑判断
 */
export const fileRepository = {
  /**
   * 创建文件记录
   */
  async create(data: CreateFileServiceDTO): Promise<IFile> {
    const file = new FileModel({
      ...data,
      // 使用枚举，禁止手写字符串
      stage: FILE_STAGE_ENUM[0], // "uploaded"
    });
    return file.save();
  },

  /**
   * 分页查询
   * @param query 分页参数
   * @param filter 额外的过滤条件
   */
  async findAll(
    query: PaginationQuery,
    filter: FilterQuery<IFile> = {}
  ): Promise<PaginatedResult<IFile>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = "createdAt",
      order = "desc",
    } = query;
    const skip = (page - 1) * pageSize;

    // 1. 默认过滤：除非显式查询 isDeleted 状态，否则默认排除已删除文件
    const finalFilter: FilterQuery<IFile> = {
      ...filter,
      // 如果 filter 里没有指定 stage，则默认排除 isDeleted
      ...(filter.stage ? {} : { stage: { $ne: "isDeleted" } }),
    };

    // 2. 并行执行：查询数据 + 统计总数
    const [items, total] = await Promise.all([
      FileModel.find(finalFilter)
        .select("-__v -analysisResult") // 列表页剔除大字段
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .lean<IFile[]>(), // 返回纯 JSON 对象，性能更高
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
   * 注意：这里不使用 lean()，因为 Service 层可能需要修改返回的 Document 并 .save()
   */
  async findById(id: string): Promise<IFile | null> {
    return FileModel.findById(id);
  },

  /**
   * 根据 Hash 查找 (秒传检测)
   */
  async findByHash(hash: string): Promise<IFile | null> {
    return FileModel.findOne({ hash, stage: { $ne: "isDeleted" } });
  },

  /**
   * 更新文件
   */
  async updateById(
    id: string,
    updates: UpdateFileServiceDTO // 使用 ServiceDTO 或 UpdateQuery
  ): Promise<IFile | null> {
    return FileModel.findByIdAndUpdate(
      id,
      { $set: updates }, // 使用 $set 确保是局部更新
      { new: true } // 返回更新后的对象
    );
  },

  /**
   * [软删除] 标记为删除状态
   * 业务通常使用这个
   */
  async softDeleteById(id: string): Promise<IFile | null> {
    return FileModel.findByIdAndUpdate(
      id,
      { stage: "isDeleted" }, // 使用硬编码字符串 "isDeleted" 对应的枚举值
      { new: true }
    );
  },

  /**
   * [物理删除] 从数据库彻底抹除
   * 仅用于管理员清理或回滚
   */
  async hardDeleteById(id: string): Promise<IFile | null> {
    return FileModel.findByIdAndDelete(id);
  },
};
