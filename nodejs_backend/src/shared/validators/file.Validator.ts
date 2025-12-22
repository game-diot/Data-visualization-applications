import { ALLOWED_EXTENSIONS } from "../constants/file.constant";
import { ValidationException } from "../exceptions/validation.exception";
import { envConfig, EnvConfig } from "@app/config/env.config";
export class FileValidator {
  /**
   * ✅ 供 Multer 使用的纯逻辑检查 (返回 boolean)
   */
  static isValidExtension(filename: string): boolean {
    // 优化：确保文件名里包含 ".", 否则视作无后缀
    if (!filename.includes(".")) return false;

    const ext = filename.split(".").pop()?.toLowerCase();
    return !!ext && ALLOWED_EXTENSIONS.includes(ext);
  }

  // --------------------------------------------
  // 下面是供 Controller 使用的业务校验 (抛出异常)
  // --------------------------------------------

  static validateFilePresence(file?: Express.Multer.File | null) {
    if (!file) {
      throw new ValidationException({
        field: "file",
        message: "上传的文件不能为空",
      });
    }
  }

  static validateFileSize(file: Express.Multer.File) {
    if (file.size > envConfig.upload.maxSize) {
      throw new ValidationException({
        field: "file",
        message: `文件大小不能超过 ${
          envConfig.upload.maxSize / 1024 / 1024
        } MB`,
      });
    }
  }

  static validateFileType(file: Express.Multer.File) {
    // 复用上面的逻辑
    if (!this.isValidExtension(file.originalname)) {
      const ext = file.originalname.split(".").pop()?.toLowerCase();
      // 优化提示：告诉用户当前传了什么，以及支持什么
      throw new ValidationException({
        field: "file",
        message: `不支持的文件类型: .${
          ext || "未知"
        } (仅支持: ${ALLOWED_EXTENSIONS.join(", ")})`,
      });
    }
  }

  static validateAll(file?: Express.Multer.File | null) {
    this.validateFilePresence(file);
    // 此时 file 肯定不为 null，使用 ! 断言是安全的
    this.validateFileSize(file!);
    this.validateFileType(file!);
  }
}
