import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from '@/app/router/root'

export const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: lazyRouteComponent(() => import('@/features/files/pages/FilesListPage')),
})
// 定义详情页路由
export const fileDetailRoute = createRoute({
  // 绑定父级路由，这样它会渲染在 /files 的 Outlet 之下，或者直接挂在 root 下
  getParentRoute: () => rootRoute,
  // 使用 :fileId 定义路径参数
  path: '/files/$fileId',
  // 使用延迟加载，保持首屏性能
  component: lazyRouteComponent(() => import('@/features/files/pages/FileDetailPage')),
})
