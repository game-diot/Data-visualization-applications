// src/monitoring/deviceContext.ts
/**
 * 采集当前运行环境上下文，用于辅助错误定位/上报
 */

type NetworkInfo =
  | {
      effectiveType?: string
      downlink?: number
      rtt?: number
    }
  | 'unknown'

type MemoryInfo =
  | {
      usedJSHeapSizeMB: number
      jsHeapSizeLimitMB: number
    }
  | 'unknown'

type DeviceContext = {
  url: string
  timestamp: string
  network: NetworkInfo
  memory: MemoryInfo
  userAgent: string
}

type NavigatorConnectionLike = {
  effectiveType?: string
  downlink?: number
  rtt?: number
}

type PerformanceMemoryLike = {
  usedJSHeapSize: number
  jsHeapSizeLimit: number
}

export const getDeviceContext = (): DeviceContext => {
  // 兼容测试环境/极端情况下 window 不存在
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      url: '',
      timestamp: new Date().toISOString(),
      network: 'unknown',
      memory: 'unknown',
      userAgent: '',
    }
  }

  const navAny = navigator as unknown as {
    connection?: NavigatorConnectionLike
    mozConnection?: NavigatorConnectionLike
    webkitConnection?: NavigatorConnectionLike
  }

  const conn = navAny.connection || navAny.mozConnection || navAny.webkitConnection

  const perfAny = performance as unknown as { memory?: PerformanceMemoryLike }
  const memory = perfAny.memory

  return {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    network: conn
      ? { effectiveType: conn.effectiveType, downlink: conn.downlink, rtt: conn.rtt }
      : 'unknown',
    memory: memory
      ? {
          usedJSHeapSizeMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          jsHeapSizeLimitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        }
      : 'unknown',
    userAgent: navigator.userAgent,
  }
}
