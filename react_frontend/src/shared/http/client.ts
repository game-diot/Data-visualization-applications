// src/shared/http/client.ts
import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'

import { AppError, type ApiResponse } from '@/shared/types/api'

/**
 * 原始 client：不解包，保留 AxiosResponse（用于下载/上传/需要 headers 等场景）
 */
export const rawHttpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 内部 instance：用于“解包型” client（拦截器成功时返回 body.data）
 * 注意：Axios 类型系统默认要求拦截器返回 AxiosResponse，因此我们在导出时会做类型断言。
 */
const httpClientInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * retry 配置：shared 层不依赖 monitoring/logger，这里只做最小行为
 * 如果你想记录 retry 日志，放到 app 层或 monitoring 注入更合适。
 */
const retryConfig: Parameters<typeof axiosRetry>[1] = {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 502,
}

axiosRetry(httpClientInstance, retryConfig)
axiosRetry(rawHttpClient, retryConfig)

httpClientInstance.interceptors.response.use(
  ((response: AxiosResponse<ApiResponse<unknown>>) => {
    const body = response.data

    const isSuccess = body.status === 'success' || body.status === 'error' || body.code === 0
    if (isSuccess) return body.data

    throw new AppError({
      message: body.message || '业务处理失败',
      code: body.code ?? -1,
      isBusinessError: true,
      originalError: body,
      requestId: (body as any).requestId,
      stage: (body as any).stage,
    })
  }) as any,
  (error: AxiosError) => Promise.reject(error),
)

/**
 * 关键：导出“解包型” client
 * 通过类型断言告诉 TS：httpClient.get<T>() 返回 Promise<T>（而不是 AxiosResponse<T>）。
 *
 * 说明：
 * - 运行时我们确实在拦截器里返回了 body.data
 * - TS 无法从 axios 的拦截器类型推导“响应被解包”，所以需要这一层断言
 */
export const httpClient = httpClientInstance as unknown as AxiosInstance
