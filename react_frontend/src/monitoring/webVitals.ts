// src/monitoring/webVitals.ts
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import { logger } from '@/monitoring/logger'

// 指标预算阈值（可写进论文：性能预算机制）
const BUDGETS = {
  LCP: 2500, // ms
  INP: 200, // ms（交互响应）
  CLS: 0.1, // 无单位
} as const

type VitalName = keyof typeof BUDGETS

const hasBudget = (name: string): name is VitalName => name in BUDGETS

export type WebVitalsOptions = {
  /**
   * 当指标为 poor 且存在预算阈值时触发（默认不做 UI 行为）
   * 可在 app 层注入：弹 toast、上报、写入 debug panel
   */
  onPoorMetric?: (metric: Metric, budget: number) => void
}

const reportHandler = (options?: WebVitalsOptions) => (metric: Metric) => {
  if (!import.meta.env.DEV) return

  logger.info('WebVitalsMetric', metric, {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: (metric as any).navigationType,
  })

  if (metric.rating === 'poor' && hasBudget(metric.name)) {
    options?.onPoorMetric?.(metric, BUDGETS[metric.name])
  }
}

export const initWebVitals = (options?: WebVitalsOptions) => {
  const handler = reportHandler(options)

  onCLS(handler)
  onLCP(handler)
  onFCP(handler)
  onTTFB(handler)
  onINP(handler)
}
