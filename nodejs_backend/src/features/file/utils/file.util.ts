import fs from "fs";
import crypto from "crypto";

export const fileHelper = {
  /**
   * 1. 计算文件的 MD5 哈希值
   * 用于实现“秒传”功能：通过比对 Hash 判断文件是否已存在
   */
  async calculateHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("md5");
      const stream = fs.createReadStream(filePath);

      // 流式读取，防止大文件爆内存
      stream.on("data", (data) => {
        hash.update(data);
      });

      stream.on("end", () => {
        resolve(hash.digest("hex"));
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });
  },

  /**
   * 2. 安全删除本地文件
   * 用于：
   * - 秒传命中后，删除刚刚上传的临时文件
   * - 文件上传失败后的回滚清理
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error: any) {
      // 如果文件本来就不存在 (ENOENT)，说明已经被删了，忽略报错
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  },

  /**
   * 3. 获取文件大小 (辅助)
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await fs.promises.stat(filePath);
      return stat.size;
    } catch (error) {
      return 0;
    }
  },
};
