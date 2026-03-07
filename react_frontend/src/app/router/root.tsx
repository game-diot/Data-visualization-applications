import { createRootRoute } from '@tanstack/react-router'
import { Button } from 'antd'

import { AppLayout } from '@/app/layouts/AppLayout'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorPanel } from '@/shared/ui/ErrorPannel'

export const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: () => (
    <EmptyState
      title="404"
      description="找不到该页面"
      action={
        <Button type="primary" onClick={() => window.history.back()}>
          返回上一页
        </Button>
      }
    />
  ),
  errorComponent: () => (
    <div className="p-8">
      <ErrorPanel message="出现错误" />
    </div>
  ),
})
