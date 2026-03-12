import fs from "fs"; // 使用标准 fs 处理流
import crypto from "crypto";
import { pipeline } from "stream/promises";

// 1. 内部依赖
import { fileRepository } from "../repository/file.repository";
import { IFile } from "../models/interface/ifile.interface";
import {
  CreateFileServiceDTO,
  UpdateFileServiceDTO,
} from "../dto/fileService.dto";
import { FileStage } from "../constant/file-stage.constant";

// 2. 共享依赖
import {
  PaginationQuery,
  PaginatedResult,
} from "../../../shared/types/pagination.type"; // 需自行定义
import { logger } from "../../../shared/utils/logger.util"; // 需自行定义
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception"; // 需自行定义
import { fileHelper } from "../utils/file.util"; // 需自行定义

// 3. 核心解耦：引入事件总线
// (后续需要在 shared/infrastructure/event-bus.ts 中创建)
import { eventBus } from "../../../app/core/eventBus.core";
import { buildPaginatedResult } from "@shared/utils/pagination.util";
import { qualityController } from "features/quality/controllers/quality.controller";
import { qualityService } from "features/quality/services/quality.services";
// 对外 DTO（只允许 name）
export interface UpdateFilePublicDTO {
  name: string;
}
export const fileService = {
  /**
   * [核心业务] 处理上传 -> 查重 -> 入库 -> 广播事件
   */
  async processUpload(data: CreateFileServiceDTO): Promise<IFile> {
    // 1. 计算 Hash (使用 Stream 防止内存溢出)
    const hash = await this.calculateFileHash(data.path);

    // 2. 秒传检测 (Deduplication)
    const existingFile = await fileRepository.findByHash(hash);
    if (existingFile) {
      logger.info(`⚡️ [Upload] Seconds-transmission triggered: ${hash}`);
      // 删除本次上传的临时/冗余文件
      await fileHelper.deleteFile(data.path);
      return existingFile;
    }

    // 3. 新文件入库
    // 注意：这里不直接调用 QualityService，而是保持纯净
    const newFile = await fileRepository.create({
      ...data,
      hash,
    });
    logger.info(`💾 [Upload] File saved to DB: ${newFile._id}`);

    // 4. 🔥 广播事件：文件已创建
    // 任何关心此文件的模块 (Quality, Analysis, Notification) 都可以监听此事件
    eventBus.emit("FILE_UPLOADED", {
      fileId: newFile._id.toString(),
      filePath: newFile.path,
      userId: newFile.userId,
    });

    return newFile;
  },

  /**
   * [辅助] 流式计算 Hash (内存安全)
   */
  async calculateFileHash(filePath: string): Promise<string> {
    const hash = crypto.createHash("md5");
    const input = fs.createReadStream(filePath);
    await pipeline(input, hash);
    return hash.digest("hex");
  },

  /**
   * 获取文件列表 (分页)
   */
  async getAllFiles(
    query: PaginationQuery,
    filter: any = {}, // 🛠️ 核心修复 3：新增 filter 参数
  ): Promise<PaginatedResult<IFile>> {
    // 🛠️ 核心修复 4：将 filter 喂给 findAll
    const { items, total, page, pageSize } = await fileRepository.findAll(
      query,
      filter,
    );

    return buildPaginatedResult(items, total, page, pageSize);
  },

  /**
   * 获取详情
   */
  async getFileById(id: string): Promise<IFile> {
    const file = await fileRepository.findById(id);
    if (!file) {
      throw new FileNotFoundException(`File ID ${id} not found.`);
    }
    return file;
  },

  /**
   * 更新文件信息
   */

  async updateFilePublic(
    id: string,
    updates: UpdateFilePublicDTO,
  ): Promise<IFile> {
    // 只更新 name
    const updatedFile = await fileRepository.updateById(id, {
      name: updates.name,
    } as any);

    if (!updatedFile) {
      throw new FileNotFoundException(`File ID ${id} not found for update.`);
    }

    logger.info(`📝 [UpdatePublic] File name updated: ${id}`);
    return updatedFile;
  },

  /**
   * 软删除 (推荐业务使用)
   */
  async deleteFile(id: string): Promise<IFile> {
    const deletedFile = await fileRepository.softDeleteById(id);
    if (!deletedFile) {
      throw new FileNotFoundException(`File ID ${id} not found.`);
    }

    logger.info(`🗑️ [SoftDelete] File marked as deleted: ${id}`);

    // 广播事件：文件已进入回收站
    eventBus.emit("FILE_SOFT_DELETED", { fileId: id });

    return deletedFile;
  },

  /**
   * 物理删除 (管理员/清理任务)
   * 包含：文件实体删除 + 数据库记录删除 + 广播清理事件
   */
  async hardDeleteFile(fileId: string): Promise<IFile> {
    // 1️⃣ 查询文件
    const file = await fileRepository.findById(fileId);
    if (!file) throw new FileNotFoundException(`File ID ${fileId} not found.`);

    // 2️⃣ 删除物理文件 (吞掉错误，防止因为文件不存在导致DB没删掉)
    try {
      await fileHelper.deleteFile(file.path);
      logger.info(`🗑️ [FileSystem] Physical file deleted: ${file.path}`);
    } catch (err) {
      logger.warn(`⚠️ [FileSystem] Failed to delete physical file: ${err}`);
    }

    // 3️⃣ 数据库物理删除
    // 注意：这里只删 File 表，不操作 Quality 表
    const deletedFile = await fileRepository.hardDeleteById(fileId);
    if (!deletedFile)
      throw new FileNotFoundException(`File ID ${fileId} not found.`);

    // 4️⃣ 🔥 广播事件：文件被彻底销毁
    // Quality 模块监听到这个事件后，负责清理自己的 report
    eventBus.emit("FILE_HARD_DELETED", { fileId });

    logger.info(`💀 [HardDelete] File destroyed: ${fileId}`);
    return deletedFile;
  },
};
