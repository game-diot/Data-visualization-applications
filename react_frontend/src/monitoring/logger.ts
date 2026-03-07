// src/monitoring/logger.ts
import { getDeviceContext } from '@/shared/env/deviceContext'

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

export type LogPayload = {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  context: ReturnType<typeof getDeviceContext>
  meta?: Record<string, unknown>
}

type LogTransport = (payload: LogPayload) => void

class Logger {
  private isDev = import.meta.env.DEV
  private transport?: LogTransport

  /** 预留：未来接入 Sentry/后端日志上报 */
  setTransport(transport: LogTransport) {
    this.transport = transport
  }

  private buildPayload(
    level: LogLevel,
    message: string,
    data?: unknown,
    meta?: Record<string, unknown>,
  ): LogPayload {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      meta,
      context: getDeviceContext(),
    }
  }

  private consoleOutput(payload: LogPayload) {
    if (!this.isDev && payload.level === 'DEBUG') return

    const colors: Record<LogLevel, string> = {
      DEBUG: '#8c8c8c',
      INFO: '#1677ff',
      WARN: '#faad14',
      ERROR: '#f5222d',
    }

    const { level, message } = payload
    const color = colors[level]

    const prefix = `%c[${level}]%c ${message}`
    const style1 = `color: white; background: ${color}; padding: 2px 5px; border-radius: 3px;`
    const style2 = `color: ${color}; font-weight: bold;`

    // 使用对应的 console 方法，便于过滤
    const fn =
      level === 'ERROR'
        ? console.error
        : level === 'WARN'
          ? console.warn
          : level === 'INFO'
            ? console.info
            : console.debug

    fn(prefix, style1, style2, payload)
  }

  private emit(level: LogLevel, message: string, data?: unknown, meta?: Record<string, unknown>) {
    const payload = this.buildPayload(level, message, data, meta)

    this.consoleOutput(payload)

    // prod 环境也可以上报（由 transport 决定）
    if (this.transport) {
      try {
        this.transport(payload)
      } catch {
        // transport 失败不应影响主流程
      }
    }
  }

  debug(message: string, data?: unknown, meta?: Record<string, unknown>) {
    this.emit('DEBUG', message, data, meta)
  }
  info(message: string, data?: unknown, meta?: Record<string, unknown>) {
    this.emit('INFO', message, data, meta)
  }
  warn(message: string, data?: unknown, meta?: Record<string, unknown>) {
    this.emit('WARN', message, data, meta)
  }
  error(message: string, data?: unknown, meta?: Record<string, unknown>) {
    this.emit('ERROR', message, data, meta)
  }
}

export const logger = new Logger()
