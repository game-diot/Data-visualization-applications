import crypto from "crypto";

/**
 * 加密与哈希工具集
 * 职责：提供基于 Node.js crypto 模块的通用加密、哈希、随机数生成能力
 */
export const cryptoUtils = {
  /**
   * 计算 MD5 哈希
   * ⚠️ 注意：MD5 不安全，严禁用于密码存储！
   * ✅ 场景：仅用于文件完整性校验 (Checksum)、去重、生成 ETag
   * @param content 字符串或二进制 Buffer
   */
  md5(content: string | Buffer): string {
    return crypto.createHash("md5").update(content).digest("hex");
  },

  /**
   * 计算 SHA256 哈希
   * ✅ 场景：数字签名、更高安全要求的文件校验
   * @param content 字符串或二进制 Buffer
   */
  sha256(content: string | Buffer): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  },

  /**
   * 生成随机十六进制 ID (通常用于生成文件名、Token、Salt)
   * @param lengthBytes 字节长度 (默认 16 字节 -> 生成 32 字符的 hex 串)
   */
  randomId(lengthBytes = 16): string {
    return crypto.randomBytes(lengthBytes).toString("hex");
  },

  /**
   * 生成标准 UUID v4
   * ✅ 场景：数据库主键、RequestId
   * Node.js v14.17+ 内置支持，无需引入 uuid 库
   */
  uuid(): string {
    return crypto.randomUUID();
  },

  /**
   * 比较两个哈希值是否相等 (防时序攻击)
   * ✅ 场景：验证 API Key 或签名时使用，防止黑客通过响应时间推测密钥
   */
  timingSafeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  },
};
