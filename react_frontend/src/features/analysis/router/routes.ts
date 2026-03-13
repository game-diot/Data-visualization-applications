import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { z } from 'zod'
import { rootRoute } from '@/app/router/root'

// 🚀 核心修复：使用 z.coerce.number()，让 "10" 自动变成数字 10
export const analysisSearchSchema = z.object({
  qv: z.coerce.number().positive().optional(),
  cv: z.coerce.number().nonnegative().optional(),
})

export const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files/$fileId/analysis', // 确保你的 path 写对了
  validateSearch: (search) => analysisSearchSchema.parse(search),
  component: lazyRouteComponent(() => import('@/features/analysis/pages/AnalysisPage')),
})
