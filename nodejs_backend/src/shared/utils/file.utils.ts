import fs from "fs/promises";
import { constants } from "fs"; // 用于访问 R_OK 等常量
import path from "path";
import { envConfig } from "../../app/config/env.config";
import { logger } from "./logger.util";

/**
 * 文件系统工具集
 * 职责：提供基于 Promise 的异步文件操作，屏蔽底层 path 细节
 */
export const fileUtils = {
  /**
   * 系统启动时初始化目录
   * 职责：确保临时目录和持久化目录存在
   */
  async ensureDirectories(): Promise<void> {
    const { tempDir, persistDir } = envConfig.upload;
    const dirs = [tempDir, persistDir];

    for (const dir of dirs) {
      const absolutePath = path.isAbsolute(dir)
        ? dir
        : path.resolve(process.cwd(), dir);
      try {
        // 检查目录是否可写
        await fs.access(absolutePath, constants.W_OK);
      } catch {
        // 目录不存在或不可写，尝试创建
        logger.info(`📂 [FileUtils] Creating directory: ${absolutePath}`);
        await fs.mkdir(absolutePath, { recursive: true });
      }
    }
  },

  /**
   * 删除文件 (安全包装)
   * @param filePath 绝对路径或相对路径
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.debug(`🗑️ [FileUtils] Deleted: ${filePath}`);
    } catch (error: any) {
      // 如果文件本身就不存在，忽略错误，视为删除成功
      if (error.code === "ENOENT") {
        return;
      }
      logger.error(
        `❌ [FileUtils] Delete failed: ${filePath}, Error: ${error.message}`
      );
      throw error;
    }
  },

  /**
   * 检查文件是否存在
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 获取文件大小 (字节)
   */
  async getSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  },

  /**
   * 移动文件 (通常用于从 Temp 到 Uploads)
   */
  async moveFile(source: string, destination: string): Promise<void> {
    try {
      await fs.rename(source, destination);
    } catch (error) {
      logger.error(
        `❌ [FileUtils] Move failed from ${source} to ${destination}`
      );
      throw error;
    }
  },
};
