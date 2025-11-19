import multer from "multer";
import fs from "fs";
import path from "path";
import { MAX_FILE_SIZE_BYTES } from "@shared/constants/fileTypes.constants";
import { FileValidator } from "@shared/validators/file.Validator"; // 引入 Validator

// 1. 基础配置
const uploadDir = path.join(process.cwd(), "uploadFiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. 存储引擎 (保持不变)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}_${Date.now()}${ext}`);
  },
});

// 3. 导出实例 (逻辑极度简化)
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 直接使用常量
  },
  // 直接复用 Validator 的逻辑
  fileFilter: (req, file, cb) => {
    if (FileValidator.isValidExtension(file.originalname)) {
      cb(null, true);
    } else {
      // 注意：这里的 Error 通常会被 Express 的全局 Error Handler 捕获
      // 为了用户体验，你也可以在这里 cb(null, false) 然后在 Controller 里再次校验抛出详细错误
      cb(new Error(`文件类型不支持: ${path.extname(file.originalname)}`));
    }
  },
});
