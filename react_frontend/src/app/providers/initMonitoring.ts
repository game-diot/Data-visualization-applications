import { useEffect } from 'react'
import { initWebVitals } from '@/monitoring/webVitals'
import { initGlobalErrorHandler } from '@/monitoring/globalErrorHandler'
import { notify } from '@/shared/utils/notify'

export const useInitMonitoring = () => {
  useEffect(() => {
    initGlobalErrorHandler()

    initWebVitals({
      onPoorMetric(metric, budget) {
        // 仅 dev 做提示，避免 prod 噪音
        if (!import.meta.env.DEV) return

        notify('warning', {
          title: `性能超标警告: ${metric.name}`,
          description: `当前 ${metric.value.toFixed(2)}，阈值 ${budget}。请检查资源加载或渲染逻辑。`,
          placement: 'bottomRight',
          key: `vitals-${metric.name}`,
          throttleMs: 3000,
        })
      },
    })
  }, [])
}
