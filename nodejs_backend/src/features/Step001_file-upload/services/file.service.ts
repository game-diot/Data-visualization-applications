import axios from "axios";
import { fileRepository } from "../repository/file.repository";
import { IFileDocument, IFile } from "../models/File.model";
import { CreateFileServiceDTO, UpdateFileDTO } from "../dto/file.dto";
import {
  PaginationQuery,
  PaginatedResult,
} from "../../../shared/types/pagination.type"; // 假设路径
import { logger } from "../../../app/config/logger.config";
import { FileNotFoundException } from "../../../shared/exceptions/fileNotFound.exception";
import { fileHelper } from "../utils/file.util"; // 刚才写的 utils

// 配置 FastAPI 的地址 (建议放到环境变量 .env 中)
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export const fileService = {
  /**
   * 核心方法：处理上传 -> 查重 -> 入库 -> 触发分析
   */
  async processUpload(data: CreateFileServiceDTO): Promise<IFileDocument> {
    // 1. 计算文件指纹 (Hash)
    const hash = await fileHelper.calculateHash(data.path);

    // 2. 秒传检测 (Deduplication)
    const existingFile = await fileRepository.findByHash(hash);
    if (existingFile) {
      logger.info(`[Upload] Seconds-transmission triggered for hash: ${hash}`);

      // ⚠️ 关键：因为是秒传，Multer 刚刚保存的物理文件是多余的，必须删除，否则磁盘会爆
      await fileHelper.deleteFile(data.path);

      // 这里的逻辑可以灵活：
      // 选项 A: 直接返回旧文件记录 (简单)
      // 选项 B: 创建一条新记录指向同一个 storedName (多用户隔离更推荐，但毕设可以用 A)
      return existingFile;
    }

    // 3. 如果是新文件，完善 DTO 信息并入库
    data.hash = hash;
    // 补充用户ID (如果有)
    // data.userId = ...

    const newFile = await fileRepository.create(data);
    logger.info(`[Upload] New file saved to DB: ${newFile._id}`);

    // 4. 🔥 异步触发 FastAPI 分析 (Fire and Forget)
    // 不等待分析结果直接返回，提升前端响应速度
    this.triggerAnalysis(newFile).catch((err) => {
      logger.error(`[Analysis Trigger] Failed for file ${newFile._id}:`, err);
    });

    return newFile;
  },

  /**
   * 内部方法：调用 Python 接口进行分析
   */
  async triggerAnalysis(file: IFileDocument): Promise<void> {
    try {
      // 更新状态：正在传输
      await fileRepository.updateById(file.id, { stage: "transferring" });

      // 发送请求给 FastAPI
      // 假设 FastAPI 的接口是 POST /api/v1/analysis/upload
      // 我们传递 fileId 和 物理路径，或者直接传文件流 (看你 Python 端怎么写，通常传路径效率最高)
      const response = await axios.post(
        `${FASTAPI_URL}/api/v1/analysis/start`,
        {
          fileId: file.id,
          filePath: file.path, // 告诉 Python 去哪里读文件
          fileType: file.extension, // 告诉 Python 文件类型
        }
      );

      // 更新状态：Python 已接收，正在分析
      await fileRepository.updateById(file.id, {
        stage: "analyzing",
        fastApiFileId: response.data.taskId, // 假设 Python 返回任务 ID
      });

      logger.info(`[Analysis] Task started for file ${file.id}`);
    } catch (error: any) {
      logger.error(`[Analysis] Communication failed:`, error.message);
      // 记录错误状态
      await fileRepository.updateById(file.id, {
        stage: "failed",
        errorMessage: `Connection to Analysis Engine failed: ${error.message}`,
      });
    }
  },

  /**
   * 获取文件列表
   */
  async getAllFiles(query: PaginationQuery): Promise<PaginatedResult<IFile>> {
    // 1. 从 Repository 获取基础数据 (items, total, page, pageSize)
    const result = await fileRepository.findAll(query);

    // 2. ⭐️ 在 Service 层计算 totalPages
    // 公式：总页数 = 向上取整(总条数 / 每页大小)
    // 防止除以 0 的情况，虽然默认值有保障，但加个 || 1 更安全
    const totalPages = Math.ceil(result.total / (result.pageSize || 10));

    // 3. 组装最终结果并返回
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: totalPages, // ✅ 这里补上了缺少的属性
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
   * 用于：
   * 1. 业务逻辑更新 (如重命名)
   * 2. 状态回调更新 (虽然 saveAnalysisResult 也可以做，但通用更新接口是必须的)
   */
  async updateFile(id: string, updates: UpdateFileDTO): Promise<IFileDocument> {
    // 调用 Repository 进行更新 (new: true 已经在 Repository 里配置了)
    const updatedFile = await fileRepository.updateById(id, updates);

    // 检查是否存在
    if (!updatedFile) {
      throw new FileNotFoundException(`File ID ${id} not found for update.`);
    }

    logger.info(`[Update] File updated: ${id}`);
    return updatedFile;
  },

  /**
   * 删除文件 (适配软删除)
   */
  async deleteFile(id: string): Promise<IFileDocument> {
    // 1. 软删除数据库记录 (isDeleted: true)
    const deletedFile = await fileRepository.deleteById(id);

    if (!deletedFile) {
      throw new FileNotFoundException(`File ID ${id} not found.`);
    }

    // 2. ⚠️ 注意：既然是软删除，物理文件通常保留，或者移入回收站目录
    // 如果你决定彻底删除物理文件，请使用 fileRepository.hardDeleteById 配合 fileHelper.deleteFile

    logger.info(`[Delete] File soft deleted: ${id}`);
    return deletedFile;
  },

  /**
   * (回调接口) Python 分析完成后调用此方法保存结果
   */
  async saveAnalysisResult(
    id: string,
    resultData: any
  ): Promise<IFileDocument> {
    logger.info(`[Callback] Received analysis result for ${id}`);
    return fileRepository.updateById(id, {
      stage: "processed",
      analysisResult: resultData,
      analysisCompletedAt: new Date(),
    }) as Promise<IFileDocument>;
  },
};
