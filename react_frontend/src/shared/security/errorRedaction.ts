// src/shared/security/errorRedaction.ts

/**
 * 错误信息脱敏工具
 * - Dev：尽量提供可调试信息（但仍要可控/可序列化）
 * - Prod：最小暴露，隐藏堆栈/路径/超长内容
 */

// 匹配类似 /usr/local/... 或 C:\... 的绝对路径
const PATH_REGEX = /(?:\/[a-zA-Z0-9_.-]+){2,}|[a-zA-Z]:\\[a-zA-Z0-9_.\-\\]+/g

export type RedactedError = {
  message: string
  detail?: unknown
  stack?: string // 仅 Dev 环境存在
  isRedacted: boolean
}

const toMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as any).message === 'string'
  ) {
    return (error as any).message as string
  }
  return fallbackMessage
}

const pickDetail = (error: unknown): unknown => {
  if (!error || typeof error !== 'object') return undefined

  const anyErr = error as any

  // 常见错误结构：axios / 自定义 AppError
  return anyErr.detail ?? anyErr.response?.data ?? anyErr.cause
}

const redactText = (text: string) => text.replace(PATH_REGEX, '[***PATH_REDACTED***]')

export const redactError = (
  error: unknown,
  fallbackMessage = '系统处理时遇到预期外的情况',
): RedactedError => {
  const isProd = import.meta.env.PROD
  const rawMessage = toMessage(error, fallbackMessage)

  const detail = pickDetail(error)

  if (!isProd) {
    // Dev：允许展示更多信息，但避免把巨大对象/循环引用直接塞进 UI
    const stack =
      error &&
      typeof error === 'object' &&
      'stack' in error &&
      typeof (error as any).stack === 'string'
        ? ((error as any).stack as string)
        : undefined

    return {
      message: rawMessage,
      detail,
      stack,
      isRedacted: false,
    }
  }

  // Prod：严格裁剪
  let safeMessage = redactText(rawMessage)

  let safeDetail: any = detail

  if (typeof safeDetail === 'string') {
    safeDetail = redactText(safeDetail)
    if (safeDetail.length > 200) {
      safeDetail = safeDetail.slice(0, 200) + '... [已截断]'
    }
  } else if (safeDetail && typeof safeDetail === 'object') {
    // 生产环境避免暴露复杂对象
    safeDetail = '请联系管理员查看系统日志'
  }

  return {
    message: safeMessage,
    detail: safeDetail,
    isRedacted: true,
  }
}
