// src/monitoring/globalErrorHandler.ts
import { notification } from 'antd'
import { logger } from '@/monitoring/logger'

/**
 * 全局错误捕获初始化
 * 捕获：
 * 1) 同步运行时错误（window error）
 * 2) Promise 未处理拒绝（unhandledrejection）
 * 3) 资源加载失败（script/link/img 等）
 */

let lastNotifyKey = ''
let lastNotifyTime = 0

const notifyUser = (title: string, message: string) => {
  const now = Date.now()
  const key = `${title}:${message}`

  // 3 秒内同类提示只弹一次，避免刷屏
  if (key === lastNotifyKey && now - lastNotifyTime < 3000) return

  lastNotifyKey = key
  lastNotifyTime = now

  notification.warning({
    message: title,
    description: message,
    placement: 'topRight',
    duration: 5,
  })
}

const isIgnorableErrorMessage = (msg?: string) =>
  msg === 'ResizeObserver loop completed with undelivered notifications.' ||
  msg === 'ResizeObserver loop limit exceeded'

const getResourceUrl = (target: EventTarget | null): string | undefined => {
  if (!target || !(target instanceof HTMLElement)) return undefined
  // 兼容各种资源元素：script/link/img/audio/video 等
  const anyTarget = target as unknown as { src?: string; href?: string; currentSrc?: string }
  return anyTarget.currentSrc || anyTarget.src || anyTarget.href
}

export const initGlobalErrorHandler = () => {
  window.addEventListener(
    'error',
    (event) => {
      // 过滤已知噪音
      if (isIgnorableErrorMessage(event.message)) return

      const resourceUrl = getResourceUrl(event.target)

      if (resourceUrl) {
        const filename = (() => {
          try {
            return new URL(resourceUrl).pathname.split('/').pop() || resourceUrl
          } catch {
            return resourceUrl.split('/').pop() || resourceUrl
          }
        })()

        notifyUser('资源加载失败', `无法加载文件：${filename}`)
        logger.error('GlobalResourceError', { url: resourceUrl, message: 'resource load failed' })
        return
      }

      const message = event.message || '发生未知运行时错误'
      notifyUser('系统执行异常', message)

      logger.error('GlobalRuntimeError', {
        message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        // event.error 可能是 Error 对象，也可能是 undefined
        error: event.error,
      })
    },
    true,
  )

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as unknown
    const message =
      (typeof reason === 'object' &&
        reason &&
        'message' in (reason as any) &&
        (reason as any).message) ||
      (typeof reason === 'string' ? reason : '') ||
      '异步任务执行失败'

    notifyUser('异步执行失败', message)

    logger.error('UnhandledRejection', {
      reason,
    })

    // dev 保留浏览器默认输出，便于定位；prod 可避免刷屏（可选）
    if (!import.meta.env.DEV) {
      event.preventDefault()
    }
  })
}
