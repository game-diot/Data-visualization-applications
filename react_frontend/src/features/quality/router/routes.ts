import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from '@/app/router/root'

export const qualityRoute = createRoute({
  getParentRoute: () => rootRoute,
  // ⬇️ 核心修正：加入动态参数 $fileId
  path: '/files/$fileId/quality',
  component: lazyRouteComponent(() => import('@/features/quality/pages/QualityPage')),
})
