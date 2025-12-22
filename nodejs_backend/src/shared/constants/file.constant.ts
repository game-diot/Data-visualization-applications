/**
 * 文件相关常量定义
 * 职责：定义系统支持的文件类型、后缀映射等静态事实
 */

// ==========================================
// 1. MIME 类型定义 (Single Source of Truth)
// ==========================================
export const MIME_TYPES = {
  // 数据文件 (用于分析平台的核心格式)
  EXCEL_XLSX:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  EXCEL_XLS: "application/vnd.ms-excel",
  CSV: "text/csv",
  JSON: "application/json",

  // 图片资源 (用于头像、封面等)
  PNG: "image/png",
  JPG: "image/jpeg",
  // 某些浏览器上传 jpg 可能会识别为 image/jpg，虽然不标准但最好兼容
  JPG_LEGACY: "image/jpg",
} as const;

// ==========================================
// 2. 业务分组 (方便校验逻辑复用)
// ==========================================

// 允许进行“数据清洗与分析”的文件类型
export const DATA_ANALYSIS_MIMES = [
  MIME_TYPES.EXCEL_XLSX,
  MIME_TYPES.EXCEL_XLS,
  MIME_TYPES.CSV,
  MIME_TYPES.JSON,
] as const;

// 允许作为“图片/头像”上传的文件类型
export const IMAGE_MIMES = [
  MIME_TYPES.PNG,
  MIME_TYPES.JPG,
  MIME_TYPES.JPG_LEGACY,
] as const;

// 系统允许的所有 MIME 类型汇总
export const ALL_ALLOWED_MIMES = [
  ...DATA_ANALYSIS_MIMES,
  ...IMAGE_MIMES,
] as const;

// ==========================================
// 3. 后缀名映射 (用于前端判断或文件名生成)
// ==========================================
export const EXT_MIME_MAP = {
  ".xlsx": MIME_TYPES.EXCEL_XLSX,
  ".xls": MIME_TYPES.EXCEL_XLS,
  ".csv": MIME_TYPES.CSV,
  ".json": MIME_TYPES.JSON,
  ".png": MIME_TYPES.PNG,
  ".jpg": MIME_TYPES.JPG,
  ".jpeg": MIME_TYPES.JPG,
} as const;

// 提取所有允许的后缀名 (不带点) -> ['xlsx', 'xls', 'csv', ...]
// 用于给前端展示 "Supported formats: xlsx, csv"
export const ALLOWED_EXTENSIONS = Object.keys(EXT_MIME_MAP).map((ext) =>
  ext.replace(".", "")
);

// ==========================================
// 4. 类型定义 (Type Definitions)
// ==========================================

// 自动生成类型： "application/json" | "text/csv" | ...
export type AllowedMimeType = (typeof ALL_ALLOWED_MIMES)[number];

// 自动生成类型： "xlsx" | "csv" | ...
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];
