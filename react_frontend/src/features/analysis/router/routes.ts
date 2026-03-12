import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { z } from 'zod'
import { rootRoute } from '@/app/router/root'

// 🌟 核心：URL 参数校验，规定必须传或者解析为可选的 qv 和 cv
export const analysisSearchSchema = z.object({
  qv: z.number().positive().optional(), // qualityVersion
  cv: z.number().nonnegative().optional(), // cleaningVersion (0 表示 raw, 但 MVP 强制要求清洗)
})

export const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analysis',
  validateSearch: (search) => analysisSearchSchema.parse(search),
  // 使用延迟加载，保持首屏性能
  component: lazyRouteComponent(() => import('@/features/analysis/pages/AnalysisPage')),
})
