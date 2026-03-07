// src/shared/security/validators.ts
import { z } from 'zod'

/**
 * 全局通用的安全字段校验基准
 * 严格限制最大长度，降低恶意长文本带来的风险
 */
export const securityValidators = {
  safeName: z
    .string()
    .trim()
    .min(1, { message: '名称不能为空' })
    .max(128, { message: '名称长度不能超过 128 个字符' }),

  safeDescription: z
    .string()
    .trim()
    .max(500, { message: '描述长度不能超过 500 个字符' })
    .optional(),

  // URL Query / 搜索词：最终统一成 string（无值时为空串）
  safeQuery: z
    .string()
    .trim()
    .max(64)
    .optional()
    .transform((v) => v ?? ''),
} as const
