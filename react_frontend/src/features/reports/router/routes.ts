import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from '@/app/router/root'

export const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: lazyRouteComponent(() => import('@/features/reports/pages/ReportsPage')),
})
