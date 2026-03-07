import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from '@/app/router/root'

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: lazyRouteComponent(() => import('@/features/dashboard/pages/DashboardPage')),
})
