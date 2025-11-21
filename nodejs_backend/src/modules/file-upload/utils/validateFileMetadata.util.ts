// src/middleware/validateFile.middleware.ts (优化后：整合 Joi, 共享异常和 DTO 字段)

import type { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ValidationException } from "../../../shared/exceptions/validation.exception"; // 导入共享异常
// 导入 DTO，以便 Joi Schema 保持一致性
import { CreateFileDTO } from "../dto/createFile.dto";

// 🎯 字段名称和类型应与 CreateFileDTO 保持一致
const fileSchema = Joi.object<CreateFileDTO>({
  name: Joi.string().required().messages({
    "any.required": "原始文件名不能为空",
    "string.empty": "原始文件名不能为空",
  }),
  storedName: Joi.string()
    .required()
    .messages({ "any.required": "存储文件名不能为空" }),
  path: Joi.string()
    .required()
    .messages({ "any.required": "文件路径不能为空" }),
  size: Joi.number().min(0).required().messages({
    "any.required": "文件大小不能为空",
    "number.base": "文件大小必须为数字",
  }),
  // ✅ 使用 CreateFileDTO 中的 stage 枚举值
  stage: Joi.string()
    .valid("uploaded", "parsed", "processed")
    .default("uploaded"),
  type: Joi.string().optional(), // 对应原来的 type
  totalRows: Joi.number().optional().default(0),
  totalCols: Joi.number().optional().default(0),
  uploadTime: Joi.date()
    .optional()
    .default(() => new Date()), // 可选，由 Model 默认值或 Service 赋值
});

/**
 * 文件参数校验中间件 (用于校验请求体中的元数据)
 */
export const validateFileMetadata = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = fileSchema.validate(req.body, {
    abortEarly: false, // 报告所有错误
    allowUnknown: true, // 允许请求体中存在未定义的字段
  });

  if (error) {
    // ⭐️ 优化：将 Joi 错误转换为 ValidationException
    const validationDetails = error.details.map((detail) => ({
      field: detail.context?.key,
      message: detail.message.replace(/['"]/g, ""), // 清理引号
    })); // 抛出共享的 ValidationException，全局错误处理器将返回 400 Bad Request

    return next(new ValidationException(validationDetails));
  }

  next();
};
