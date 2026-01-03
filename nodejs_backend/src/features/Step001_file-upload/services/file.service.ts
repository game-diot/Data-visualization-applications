import fs from "fs/promises"; // 用于读取文件计算 Hash
import { fileRepository } from "../repository/file.repository";
import { IFileDocument, IFile } from "../models/File.model";
import { CreateFileServiceDTO, UpdateFileDTO } from "../dto/file.dto";
import {
  PaginationQuery,
  PaginatedResult,
} from "../../../shared/types/pagination.type";
import { logger } from "../../../shared/utils/logger.util";
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception";
import { fileUtils } from "../../../shared/utils/file.utils";
import { cryptoUtils } from "../../../shared/utils/crypto.util"; // 假设你在这个文件里封装了 md5

// ⭐️ 核心引用：将分析逻辑委托给 Quality 模块
import { qualityService } from "../../Step001.5_quality-analysis/services/quality.services";

export const fileService = {
  /**
   * 核心方法：处理上传 -> 查重 -> 入库 -> 触发分析
   */
  async processUpload(data: CreateFileServiceDTO): Promise<IFileDocument> {
    // 1. 计算文件指纹 (Hash)
    const fileBuffer = await fs.readFile(data.path);
    const hash = cryptoUtils.md5(fileBuffer);

    // 2. 秒传检测
    const existingFile = await fileRepository.findByHash(hash);
    if (existingFile) {
      logger.info(
        `⚡️ [Upload] Seconds-transmission triggered for hash: ${hash}`
      );
      await fileUtils.deleteFile(data.path);
      return existingFile;
    }

    // 3. 新文件入库
    data.hash = hash;
    const newFile = await fileRepository.create(data);
    logger.info(`💾 [Upload] New file saved to DB: ${newFile._id}`);

    // 4. 🔥 异步触发 Quality Service (Fire and Forget)
    // 修复点：传入 fileId (String)，而不是整个 Document 对象
    // Mongoose 的 _id 是 ObjectId 对象，toString() 后即为字符串 ID
    const fileIdStr = newFile._id.toString();

    qualityService.performAnalysis(fileIdStr).catch((err) => {
      logger.error(
        `🚨 [Async Trigger] Unhandled error for file ${fileIdStr}: ${err.message}`
      );
    });

    return newFile;
  },
  /**
   * 获取文件列表 (分页)
   */
  async getAllFiles(query: PaginationQuery): Promise<PaginatedResult<IFile>> {
    const result = await fileRepository.findAll(query);

    // 计算总页数
    const totalPages = Math.ceil(result.total / (result.pageSize || 10));

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: totalPages,
    };
  },

  /**
   * 获取详情
   */
  async getFileById(id: string): Promise<IFileDocument> {
    const file = await fileRepository.findById(id);
    if (!file) {
      throw new FileNotFoundException(`File ID ${id} not found.`);
    }
    return file;
  },

  /**
   * 更新文件信息
   * (如重命名、备注等，分析结果的更新走 QualityService)
   */
  async updateFile(id: string, updates: UpdateFileDTO): Promise<IFileDocument> {
    const updatedFile = await fileRepository.updateById(id, updates);

    if (!updatedFile) {
      throw new FileNotFoundException(`File ID ${id} not found for update.`);
    }

    logger.info(`📝 [Update] File updated: ${id}`);
    return updatedFile;
  },

  /**
   * 删除文件 (硬删除)
   */
  async deleteFile(id: string): Promise<IFileDocument> {
    // 1. 先查询文件是否存在 (我们需要拿到 path 才能删物理文件)
    // 注意：这里不用 findById (因为它可能过滤了 isDeleted)，我们要查出原始记录
    const file = await fileRepository.findById(id);

    // 如果用了 findById 且里面过滤了 isDeleted: false，
    // 那么已经软删除的文件就查不到了。
    // 如果想支持删除“已软删除”的文件，Repository 需要提供一个 findOriginalById 方法
    // 但通常我们只允许删除存在的文件，所以这里 findById 没问题。

    if (!file) {
      throw new FileNotFoundException(`File ID ${id} not found.`);
    }

    // 2. 执行物理文件删除 (从磁盘移除)
    // 使用 catch 防止文件本身已经不存在导致流程中断
    try {
      await fileUtils.deleteFile(file.path);
      logger.info(`🗑️ [FileSystem] Physical file deleted: ${file.path}`);
    } catch (error) {
      logger.warn(
        `⚠️ [FileSystem] Failed to delete physical file: ${file.path}`
      );
      // 物理删除失败通常不应阻断数据库删除，继续向下执行
    }

    // 3. 执行数据库硬删除 (从 MongoDB 彻底移除)
    const deletedFile = await fileRepository.hardDeleteById(id);

    if (!deletedFile) {
      throw new FileNotFoundException(
        `File ID ${id} not found during deletion.`
      );
    }

    logger.info(`🗑️ [DB] File hard deleted: ${id}`);
    return deletedFile;
  },
};
