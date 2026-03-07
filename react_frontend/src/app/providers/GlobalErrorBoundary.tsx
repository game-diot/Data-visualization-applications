import { HomeOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Result } from 'antd'
import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useNavigate } from '@tanstack/react-router'

import { logger } from '@/monitoring/logger'

function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  const navigate = useNavigate()

  const isDev = import.meta.env.DEV

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <Result
        status="500"
        title="哎呀，页面崩溃了"
        subTitle={error?.message || '发生未知错误，请稍后重试'}
        extra={[
          <Button
            key="home"
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => {
              resetErrorBoundary()
              navigate({ to: '/' })
            }}
          >
            返回首页
          </Button>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            刷新
          </Button>,
        ]}
      />

      {isDev && (
        <div className="mt-6 w-full max-w-4xl">
          <pre className="overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100 max-h-80">
            {error?.stack}
          </pre>
        </div>
      )}
    </div>
  )
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        logger.error('ReactRenderError', error, { source: 'GlobalErrorBoundary' })
        return <GlobalErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
