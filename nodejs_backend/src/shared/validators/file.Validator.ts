import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from "../constants/fileTypes.constants";
import { ValidationException } from "../exceptions/validation.exception";

export class FileValidator {
  /**
   * ✅ 供 Multer 使用的纯逻辑检查 (返回 boolean)
   */
  static isValidExtension(filename: string): boolean {
    const ext = filename.split(".").pop()?.toLowerCase();
    return !!ext && ALLOWED_EXTENSIONS.includes(ext);
  }

  // --------------------------------------------
  // 下面是供 Controller 使用的业务校验 (抛出异常)
  // --------------------------------------------

  static validateFilePresence(file?: Express.Multer.File | null) {
    if (!file) {
      throw new ValidationException("上传的文件不能为空");
    }
  }

  static validateFileSize(file: Express.Multer.File) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationException(`文件大小不能超过 ${MAX_FILE_SIZE_MB} MB`);
    }
  }

  static validateFileType(file: Express.Multer.File) {
    // 复用上面的逻辑
    if (!this.isValidExtension(file.originalname)) {
      const ext = file.originalname.split(".").pop()?.toLowerCase();
      throw new ValidationException(`文件类型不支持：${ext || "未知"}`);
    }
  }

  static validateAll(file?: Express.Multer.File | null) {
    this.validateFilePresence(file);
    this.validateFileSize(file!); // file! 断言它不为空，因为上面已经检查了
    this.validateFileType(file!);
  }
}
