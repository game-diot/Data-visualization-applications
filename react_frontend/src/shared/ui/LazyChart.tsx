import { Result } from 'antd'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { LoadingBlock } from './LoadingBlock'

// 使用 React.lazy 动态导入图表组件（此处假设你使用的是 echarts-for-react）
// 注意：真正的 ECharts 依赖在打包时会被单独抽离成一个 chunk
const ReactECharts = React.lazy(() => import('echarts-for-react'))

interface LazyChartProps {
  option: any
  height?: string | number
  className?: string
}

export const LazyChart: React.FC<LazyChartProps> = ({ option, height = 400, className }) => {
  return (
    <div style={{ height }} className={className}>
      <ErrorBoundary fallback={<Result status="warning" title="图表渲染失败" />}>
        <Suspense fallback={<LoadingBlock text="图表引擎加载中..." />}>
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
