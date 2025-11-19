// 可上传文件类型
export const FILE_TYPES = {
  EXCEL: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ],
  CSV: ["text/csv"],
  IMAGE: ["image/png", "image/jpeg", "image/jpg"],
  JSON: ["application/json"],
} as const;

// 文件后缀 → MIME 映射
export const EXT_MIME_MAP = {
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".csv": "text/csv",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
} as const;
export const ALLOWED_EXTENSIONS = Object.keys(EXT_MIME_MAP).map((key) =>
  key.replace(".", "")
);
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export type AllowedFileMime =
  | (typeof FILE_TYPES)[keyof typeof FILE_TYPES][number];
