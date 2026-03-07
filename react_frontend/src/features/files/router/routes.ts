import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from '@/app/router/root'

export const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: lazyRouteComponent(() => import('@/features/files/pages/FilesListPage')),
})
