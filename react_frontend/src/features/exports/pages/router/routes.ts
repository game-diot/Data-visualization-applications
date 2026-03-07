import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '@/app/router/root'

export const exportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exports',
  component: lazyRouteComponent(() => import('@/features/exports/pages/ExportsPage')),
})
