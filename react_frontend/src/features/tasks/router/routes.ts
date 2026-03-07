import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from '@/app/router/root'

export const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: lazyRouteComponent(() => import('@/features/tasks/pages/TaskCenterPage')),
})
