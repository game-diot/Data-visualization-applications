import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

import { queryClient } from '@/app/providers/QueryClients'
import { GlobalErrorBoundary } from '@/app/providers/GlobalErrorBoundary'
import { useInitMonitoring } from '@/app/providers/initMonitoring'
import { router } from '../router/index'

export function AppProviders() {
  useInitMonitoring()

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}
