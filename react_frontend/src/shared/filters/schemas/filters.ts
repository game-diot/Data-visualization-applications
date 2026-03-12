// src/shared/filters/schemas.ts
import { z } from 'zod'
import { securityValidators } from '@/shared/security/validators'
import { FILE_STAGE_ENUM } from '@/entities/file/constant/failStageEnum'

// 2. 魔法拼接：组合 'all' 和后端的严格状态
const SEARCH_STAGE_OPTIONS = ['all', ...FILE_STAGE_ENUM] as const

const paginationSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  pageSize: z.coerce.number().min(10).max(100).catch(10),
  order: z.enum(['asc', 'desc']).catch('desc'),
})

export const filesSearchSchema = paginationSchema.extend({
  query: securityValidators.safeQuery.optional().catch(undefined),

  // 🌟 定义 5 个生命周期大阶段
  stage: z
    .enum([
      'all', // 全部
      'stage_uploaded', // 上传阶段
      'stage_quality', // 质量检测阶段
      'stage_cleaning', // 清洗阶段
      'stage_analysis', // 分析阶段
      'stage_ai', // AI阶段
    ])
    .catch('all'),

  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).catch('createdAt'),
})
export type FilesSearch = z.infer<typeof filesSearchSchema>

// ... 保持 reportsSearchSchema 和 tasksSearchSchema 不变

export const reportsSearchSchema = paginationSchema.extend({
  version: z.string().trim().max(32).catch(''),
  hasAsset: z.enum(['all', 'true', 'false']).catch('all'),
  sortBy: z.enum(['version', 'createdAt']).catch('version'),
})
export type ReportsSearch = z.infer<typeof reportsSearchSchema>

export const tasksSearchSchema = paginationSchema.extend({
  query: securityValidators.safeQuery.optional().catch(undefined), // 加 optional + catch
  type: z.enum(['all', 'analysis', 'cleaning']).catch('all'),
  status: z.enum(['all', 'running', 'success', 'failed']).catch('all'),
  sortBy: z.enum(['createdAt', 'updatedAt']).catch('createdAt'),
})
export type TasksSearch = z.infer<typeof tasksSearchSchema>
