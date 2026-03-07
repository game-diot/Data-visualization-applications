import { createRoute, createRouter, redirect } from '@tanstack/react-router'

import { rootRoute } from '@/app/router/root'

import { dashboardRoute } from '@/features/dashboard/router/route'
import { fileDetailRoute, filesRoute } from '@/features/files/router/routes'
import { tasksRoute } from '@/features/tasks/router/routes'
import { reportsRoute } from '@/features/reports/router/routes'
import { exportsRoute } from '@/features/exports/pages/router/routes'

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  filesRoute,
  fileDetailRoute,
  reportsRoute,
  tasksRoute,
  exportsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 50,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
