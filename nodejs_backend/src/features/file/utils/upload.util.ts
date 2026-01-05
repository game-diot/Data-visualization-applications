import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
// 假设这些是你项目里的共享常量和工具
import { envConfig, EnvConfig } from "@app/config/env.config";
import { FileValidator } from "@shared/validators/file.Validator";
import { cryptoUtils } from "@shared/utils/crypto.util";

// 1. 配置上传目录 (建议：支持环境变量，且有兜底)
const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "uploadFiles");

// 安全兜底：确保目录存在 (同步操作，仅在模块加载时执行一次，不影响性能)
if (!fs.existsSync(UPLOAD_ROOT)) {
  try {
    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
    console.log(`[Init] Created upload directory: ${UPLOAD_ROOT}`);
  } catch (err) {
    console.error(`[Init] Failed to create upload directory:`, err);
  }
}

// 2. 存储引擎配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 这里也可以按日期分文件夹: uploadFiles/2025-12/
    cb(null, UPLOAD_ROOT);
  },
  filename: (req, file, cb) => {
    // 解决中文名乱码问题 (视 Node 版本和系统而定，通常这一步是为了保险)
    // const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");

    const ext = path.extname(file.originalname);
    const uniqueId = cryptoUtils.randomId(16); // 确保你的 randomId 足够强壮
    cb(null, `${uniqueId}${ext}`);
  },
});

// 3. 过滤器逻辑
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // 使用 Validator 校验扩展名
  if (FileValidator.isValidExtension(file.originalname)) {
    cb(null, true);
  } else {
    // ⭐️ 关键修改：抛出具体错误，而不是静默拒绝
    // 这里的 Error 可以在全局异常过滤器中捕获，返回 400
    cb(new Error(`Unsupported file type: ${path.extname(file.originalname)}`));
  }
};

// 4. 导出 Multer 实例
export const upload = multer({
  storage,
  limits: {
    fileSize: envConfig.upload.maxSize,
  },
  fileFilter,
});
