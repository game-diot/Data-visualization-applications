// src/modules/files/utils/upload.util.ts (优化后)

import multer from "multer";
import path from "path";
// 引入常量和共享工具
import { MAX_FILE_SIZE_BYTES } from "@shared/constants/fileTypes.constants";
import { FileValidator } from "@shared/validators/file.Validator";
import { randomId } from "@shared/utils/cryptoHelper.util"; // ✅ 导入 randomId

// 1. 基础配置 (⚠️ 移除目录创建逻辑，由核心初始化负责)
const uploadDir = path.join(process.cwd(), "uploadFiles");

// 2. 存储引擎
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // ✅ 优化点: 使用 cryptoHelper.randomId() 确保文件名唯一且安全
    const uniqueName = randomId(16); // 生成 32 字符长的随机十六进制字符串
    cb(null, `${uniqueName}${ext}`);
  },
});

// 3. 导出实例
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 限制文件大小
  }, // ✅ 优化点: fileFilter 仅负责是否接受文件，不抛出详细错误
  fileFilter: (req, file, cb) => {
    if (FileValidator.isValidExtension(file.originalname)) {
      cb(null, true); // 接受文件
    } else {
      cb(null, false); // 拒绝文件，让 Multer 抛出 'LIMIT_FILE_COUNT' 或由 Controller 校验
    }
  },
});

// ⚠️ 注意：Multer 配置 limits 后，如果文件大小超出，会抛出 'LIMIT_FILE_SIZE' 错误，
//       这个错误需要由全局错误处理器特殊处理。但对于文件类型错误，最好交给 FileValidator 处理。
