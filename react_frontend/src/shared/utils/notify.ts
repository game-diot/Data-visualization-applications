import { message, notification } from 'antd'

type NotifyLevel = 'success' | 'info' | 'warning' | 'error'

type NotifyOptions = {
  /** 统一标题（notification 用），message 用作内容 */
  title?: string
  /** 内容 */
  description: string
  /** 位置（仅 notification） */
  placement?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'top' | 'bottom'
  /** 自动关闭时间，0 表示不自动关闭（仅 notification） */
  duration?: number
  /** 同 key 的通知会被更新（notification）或复用（message） */
  key?: string
  /** 节流窗口：同 key 或同 title+description 在窗口内只提示一次 */
  throttleMs?: number
  /** 选择 message 还是 notification（默认 notification） */
  mode?: 'notification' | 'message'
}

const DEFAULTS = {
  placement: 'topRight' as const,
  duration: 4,
  throttleMs: 2500,
  mode: 'notification' as const,
}

// 记录上一次提示时间（节流）
const lastShownAt = new Map<string, number>()

const buildThrottleKey = (level: NotifyLevel, opts: NotifyOptions) => {
  if (opts.key) return `${level}:${opts.key}`
  const t = opts.title ?? ''
  const d = opts.description ?? ''
  return `${level}:${t}:${d}`
}

const shouldThrottle = (k: string, throttleMs: number) => {
  const now = Date.now()
  const last = lastShownAt.get(k) ?? 0
  if (now - last < throttleMs) return true
  lastShownAt.set(k, now)
  return false
}

const openNotification = (level: NotifyLevel, opts: NotifyOptions) => {
  const placement = opts.placement ?? DEFAULTS.placement
  const duration = opts.duration ?? DEFAULTS.duration

  // key：用于更新同一个通知（比如轮询错误不要刷屏）
  const key = opts.key

  notification[level]({
    message: opts.title ?? (level === 'error' ? '操作失败' : '提示'),
    description: opts.description,
    placement,
    duration,
    key,
  })
}

const openMessage = (level: NotifyLevel, opts: NotifyOptions) => {
  // AntD message 用 content + key
  const key = opts.key
  message.open({
    type: level,
    content: opts.description,
    key,
    duration: typeof opts.duration === 'number' ? opts.duration : 2,
  })
}

export const notify = (level: NotifyLevel, options: NotifyOptions) => {
  const throttleMs = options.throttleMs ?? DEFAULTS.throttleMs
  const throttleKey = buildThrottleKey(level, options)

  if (throttleMs > 0 && shouldThrottle(throttleKey, throttleMs)) return

  const mode = options.mode ?? DEFAULTS.mode
  if (mode === 'message') openMessage(level, options)
  else openNotification(level, options)
}

// 常用快捷方法
export const notifySuccess = (description: string, opts: Omit<NotifyOptions, 'description'> = {}) =>
  notify('success', { ...opts, description })

export const notifyInfo = (description: string, opts: Omit<NotifyOptions, 'description'> = {}) =>
  notify('info', { ...opts, description })

export const notifyWarning = (description: string, opts: Omit<NotifyOptions, 'description'> = {}) =>
  notify('warning', { ...opts, description })

export const notifyError = (
  title: string,
  description: string,
  opts: Omit<NotifyOptions, 'title' | 'description'> = {},
) => notify('error', { ...opts, title, description })

/**
 * 清理节流记录（一般不用，但测试/调试时可能有用）
 */
export const resetNotifyThrottle = () => {
  lastShownAt.clear()
}
