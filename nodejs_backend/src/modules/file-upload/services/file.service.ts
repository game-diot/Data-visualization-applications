// src/modules/files/services/file.service.ts (优化后)

import fs from "fs/promises";
import { fileRepository } from "../repository/file.repository.js"; // ✅ 引入 Repository
import { IFile, IFileDocument } from "../models/File.model";
import { CreateFileDTO, UpdateFileDTO } from "../dto"; // 引入 DTOs
// 导入共享工具和类型
import {
  PaginationQuery,
  PaginatedResult,
} from "../../../shared/types/paginationQuery.type.js";
import { logger } from "../../../app/config/logger.config.js"; // ✅ 引入 Logger
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception.js"; // ✅ 引入异常 (假设已创建)
import { parseFile } from "../../../shared/utils/fileParse.util.js"; // ✅ 引入解析工具

// ⚠️ 移除 GetAllFilesOptions，使用共享的 PaginationQuery 替代

export const fileService = {
  async createFile(data: CreateFileDTO): Promise<IFileDocument> {
    // 1. 业务逻辑：创建数据库记录
    const file = await fileRepository.create(data); // ✅ 调用 Repository // 2. 记录日志
    logger.info(`File record created: ${file.storedName} (ID: ${file._id})`);
    return file;
  },

  // ------------------------------------------------------------------
  // ⭐️ 新增功能：解析文件内容 (使用共享工具 parseFile)
  // ------------------------------------------------------------------
  async parseAndSaveMetadata(fileId: string): Promise<IFileDocument> {
    // 1. 获取文件记录，确保存在
    const record = await fileRepository.findById(fileId);
    if (!record) {
      throw new FileNotFoundException(`File ID ${fileId} not found.`); // ✅ 使用共享异常
    }

    // 2. 解析文件内容 (使用共享的 parseFile 工具)
    const parsedData = parseFile(record.path);

    // 3. 更新行数、列数和状态
    const updates: UpdateFileDTO = {
      totalRows: parsedData.length,
      totalCols: parsedData.length > 0 ? Object.keys(parsedData[0]).length : 0,
      stage: "parsed",
    };

    const updatedFile = await fileRepository.updateById(fileId, updates);
    logger.info(
      `File parsed successfully: ${record.storedName}. Rows: ${updates.totalRows}`
    );
    return updatedFile!;
  }, // ⭐️ 优化: 使用共享的 PaginationQuery 和 PaginatedResult 类型
  // ------------------------------------------------------------------

  async getAllFiles(query: PaginationQuery): Promise<PaginatedResult<IFile>> {
    // 1. 调用 Repository 获取数据和总数
    const [items, total] = await Promise.all([
      fileRepository.findAll(query), // ✅ 调用 Repository (假设已优化为接收 Query)
      fileRepository.count({}),
    ]);

    // 2. 构造 PaginatedResult 响应
    return {
      total,
      page: query.page || 1,
      pageSize: query.pageSize || 10,
      items: items as IFile[],
    };
  }, // ⚠️ 移除 countFiles，因为其逻辑应整合到 getAllFiles 中（如上）或直接在 Repository 中。

  async getFileById(id: string): Promise<IFileDocument> {
    // 返回 Document 类型
    const file = await fileRepository.findById(id); // ✅ 调用 Repository
    if (!file) {
      throw new FileNotFoundException(`File ID ${id} not found.`); // ✅ 使用共享异常
    }
    return file;
  },

  async updateFile(
    id: string,
    updates: UpdateFileDTO // ✅ 使用 UpdateFileDTO
  ): Promise<IFileDocument> {
    const updatedFile = await fileRepository.updateById(id, updates); // ✅ 调用 Repository
    if (!updatedFile) {
      throw new FileNotFoundException(`File ID ${id} not found for update.`); // ✅ 使用共享异常
    }
    return updatedFile;
  },

  async deleteFile(id: string): Promise<IFileDocument> {
    // 1. 删除数据库记录
    const deletedFile = await fileRepository.deleteById(id); // ✅ 调用 Repository
    if (!deletedFile) {
      throw new FileNotFoundException(`File ID ${id} not found for deletion.`); // ✅ 使用共享异常
    } // 2. 删除物理文件

    try {
      await fs.unlink(deletedFile.path);
      logger.info(`Successfully deleted file from disk: ${deletedFile.path}`); // ✅ 使用 Logger
    } catch (err) {
      // 使用 logger.warn 替换 console.warn
      logger.warn(
        `[deleteFile] Physical file not found or already deleted: ${deletedFile.path}`,
        err
      ); // ✅ 使用 Logger
    }

    return deletedFile;
  },
};
