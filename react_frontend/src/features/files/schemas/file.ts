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
export const filesSearchSchema = z.object({
  // 使用 catch() 兜底：如果用户在 URL 里乱敲 ?page=abc，自动降级为 1，防止页面白屏崩溃
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
  query: z.string().optional().catch(''),
  stage: z.string().optional().catch('all'),
  order: z.enum(['asc', 'desc']).optional().catch('desc'),
  sortBy: z.string().optional().catch('createdAt'),
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
