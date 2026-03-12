import { FILE_STAGE_ENUM } from '@/entities/file/constant/failStageEnum'
import { securityValidators } from '@/shared/security/validators'
import { z } from 'zod'

// 1. 你的任务状态契约 (保留，用于后续上传进度或后台任务轮询)
export const TaskStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'success', 'failed']),
  progress: z.number().min(0).max(100),
  message: z.string().nullable().optional(),
  updated_at: z.string(),
})
export type TaskStatus = z.infer<typeof TaskStatusSchema>

// 2. [建议采纳] 列表 URL 搜索参数契约 (解决之前 useQueryFilters 报错的关键)
// 1. 魔法拼接：组合 'all' 和后端所有的严格状态
// 注意 `as const` 极其重要，它保证了这不仅是个数组，更是字面量类型组合
const SEARCH_STAGE_OPTIONS = ['all', ...FILE_STAGE_ENUM] as const

export const filesSearchSchema = z.object({
  // 💡 架构师加餐：由于 URL 里的参数默认全都是 "字符串" (例如 ?page=2 会被解析为 "2")
  // 强烈建议加上 .coerce 强制转换，否则 z.number() 校验 URL 字符串时必报错，最终永远触发 catch(1)
  page: z.coerce.number().catch(1),
  pageSize: z.coerce.number().catch(10),

  order: z.enum(['asc', 'desc']).optional().catch('desc'),
  query: securityValidators.safeQuery.optional().catch(undefined),

  // 🌟 核心修改：极其严谨的枚举校验！
  // 现在它不仅能拦截非法乱敲的 URL，推导出的 FilesSearchFilters 类型也会拥有完美的自动补全
  stage: z.enum(SEARCH_STAGE_OPTIONS).catch('all'),

  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).catch('createdAt'),
})

export type FilesSearchFilters = z.infer<typeof filesSearchSchema>
// 3. [建议采纳] 重命名表单校验契约 (防 SQL 注入/越界)
export const renameFileSchema = z.object({
  name: z
    .string()
    .min(1, '数据集名称不能为空')
    .max(128, '名称长度不能超过128个字符')
    .regex(/^[\w\-. ]+$/, '名称只能包含字母、数字、下划线、中划线和空格'),
})
export type RenameFormValues = z.infer<typeof renameFileSchema>
