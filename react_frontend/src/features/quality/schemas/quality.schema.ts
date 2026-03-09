import { z } from 'zod'

// 严格锁定 forceRefresh 只能是 boolean，绝不接受 "true" 字符串或 null
export const qualityRetrySchema = z.object({
  // 如果没传，默认就是 true；如果传了非布尔值，Zod 依然会拦截报错
  forceRefresh: z.boolean().default(true),
})
// 为版本输入框提供防呆校验
export const versionInputSchema = z.object({
  // 1. 使用 coerce 自动将字符串 "2" 转为数字 2 (极其适合处理 UI 输入框)
  // 2. 用 message 替换掉不被识别的 required_error/invalid_type_error
  version: z.coerce
    .number({
      message: '请输入有效的数字版本号',
    })
    .int('版本号必须是完整的整数')
    .positive('版本号必须大于 0'),
})

export type VersionInputFormValues = z.infer<typeof versionInputSchema>

export type QualityRetryFormValues = z.infer<typeof qualityRetrySchema>
