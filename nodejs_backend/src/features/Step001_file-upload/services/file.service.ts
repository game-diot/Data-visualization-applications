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
import { qualityReportRepository } from "features/file/repository/qualityReport.repository";

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
  /**
   * 删除文件 (硬删除 + 删除分析结果)
   */
  async deleteFile(fileId: string): Promise<IFileDocument> {
    // 1️⃣ 查询文件是否存在
    const file = await fileRepository.findById(fileId);
    if (!file) throw new FileNotFoundException(`File ID ${fileId} not found.`);

    // 2️⃣ 删除物理文件
    try {
      await fileUtils.deleteFile(file.path);
      logger.info(`🗑️ [FileSystem] Physical file deleted: ${file.path}`);
    } catch (err) {
      logger.warn(
        `⚠️ [FileSystem] Failed to delete physical file: ${file.path}`
      );
    }

    // 3️⃣ 删除数据库中对应的质量分析结果
    const deletedReports = await qualityReportRepository.deleteByFileId(fileId);
    logger.info(
      `🗑️ [DB] Deleted ${deletedReports} quality report(s) for file ${fileId}`
    );

    // 4️⃣ 硬删除文件记录
    const deletedFile = await fileRepository.hardDeleteById(fileId);
    if (!deletedFile) {
      throw new FileNotFoundException(
        `File ID ${fileId} not found during deletion.`
      );
    }

    logger.info(`🗑️ [DB] File hard deleted: ${fileId}`);
    return deletedFile;
  },
};
