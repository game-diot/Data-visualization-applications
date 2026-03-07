// src/shared/error/normalizeError.ts
import { AxiosError } from 'axios'
import { redactError } from '@/shared/security/errorRedaction'
import { getDeviceContext } from '@/shared/env/deviceContext'
import { AppError } from '@/shared/types/api'

export type ErrorSource = 'api' | 'zod' | 'react' | 'global' | 'task' | 'unknown'

export type ErrorVM = {
  title: string
  message: string
  detail?: unknown
  stack?: string
  source: ErrorSource
  context: ReturnType<typeof getDeviceContext>
  code?: string | number
  stage?: string
  requestId?: string
}

const isZodErrorLike = (e: unknown): e is { issues: unknown } =>
  !!e && typeof e === 'object' && 'issues' in e

export function normalizeError(error: unknown, source: ErrorSource = 'unknown'): ErrorVM {
  const context = getDeviceContext()
  const redacted = redactError(error)

  // AppError：你自己定义的标准错误（业务/接口层），不是 React 错误
  if (error instanceof AppError) {
    // 关键：优先脱敏 originalError（里面才有 axios/zod/后端 detail）
    const redactedInner = redactError(error.originalError ?? error)

    return {
      title: error.isBusinessError ? '业务处理失败' : '请求失败',
      message: redactedInner.message,
      detail: redactedInner.detail,
      stack: redactedInner.stack,
      source,
      context,
      code: error.code,
      stage: (error as any).stage,
      requestId: (error as any).requestId,
    }
  }

  // AxiosError：无论有没有 response，都应该落到这里
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as any

    const title = status === 401 ? '登录已过期' : status ? '网络请求失败' : '网络连接异常'

    // 如果后端有统一包：{ status, code, message, data }
    const code = data?.code
    const requestId = data?.requestId

    return {
      title,
      message: redacted.message,
      detail: redacted.detail,
      stack: redacted.stack,
      source: 'api',
      context,
      code,
      requestId,
    }
  }

  // Zod：契约变更
  if (isZodErrorLike(error)) {
    return {
      title: '数据契约不匹配',
      message: '后端返回的数据格式与前端定义不符',
      detail: (error as any).issues,
      source: 'zod',
      context,
    }
  }

  // React 渲染错误（一般来自 ErrorBoundary 捕获的 Error）
  if (error instanceof Error) {
    return {
      title: source === 'react' ? '页面渲染异常' : '系统异常',
      message: redacted.message,
      detail: redacted.detail,
      stack: redacted.stack,
      source,
      context,
    }
  }

  // 默认兜底
  return {
    title: '系统异常',
    message: redacted.message,
    detail: redacted.detail,
    stack: redacted.stack,
    source,
    context,
  }
}
