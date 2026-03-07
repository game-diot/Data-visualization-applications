// src/shared/filters/schemas.ts
import { z } from 'zod'
import { securityValidators } from '@/shared/security/validators'

const paginationSchema = z.object({
  page: z.coerce.number().min(1).catch(1),
  pageSize: z.coerce.number().min(10).max(100).catch(10),
  order: z.enum(['asc', 'desc']).catch('desc'),
})

export const filesSearchSchema = paginationSchema.extend({
  query: securityValidators.safeQuery.optional().catch(undefined),
  stage: z
    .enum(['all', 'uploaded', 'quality_done', 'cleaning_done', 'analysis_done', 'failed'])
    .catch('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).catch('createdAt'),
})
export type FilesSearch = z.infer<typeof filesSearchSchema>

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
