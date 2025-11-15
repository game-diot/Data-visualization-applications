import multer from "multer";
import fs from "fs";
import path from "path";
//上传目录
const uploadDir = path.join(process.cwd(), "uploadFiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

//multer配置
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueName = `${baseName}${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});
//过滤上传类型
const allowedMimeTypes = [
  "text/csv", // CSV
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/json", // JSON
  "text/plain", // TXT
];
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型：${file.mimetype}`));
  }
};

//限制文件大小
const limits = {
  fileSize: 10 * 1024 * 1024,
};

export const upload = multer({ storage, fileFilter, limits });
