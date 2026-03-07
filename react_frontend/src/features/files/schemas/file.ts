import { z } from 'zod'

// 定义任务状态的契约
export const TaskStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'success', 'failed']),
  progress: z.number().min(0).max(100),
  message: z.string().nullable().optional(),
  updated_at: z.string(),
})

export type TaskStatus = z.infer<typeof TaskStatusSchema>
