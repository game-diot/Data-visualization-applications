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
  // 🌟 修改点 1：把范型从 ApiResponse 改成 any，因为它现在不仅要接 JSON，还要接纯文本和二进制流
  ((response: AxiosResponse<any>) => {
    // 🌟 核心修复：智能白名单旁路 (Bypass)
    // 只要我们在发起请求时明确要求了非 JSON 格式（如 text、blob、arraybuffer），
    // 拦截器直接放行，原封不动地把纯文本或文件流（response.data）返回给组件！
    const responseType = response.config.responseType
    if (responseType === 'text' || responseType === 'blob' || responseType === 'arraybuffer') {
      return response.data
    }

    // 👇 下方是原本的标准化 JSON 业务解包逻辑，完全不受影响
    const body = response.data

    const isSuccess = body.status === 'success' || body.status === 'error' || body.code === 0
    if (isSuccess) return body.data

    throw new AppError({
      message: body.message || '业务处理失败',
      code: body.code ?? -1,
      isBusinessError: true,
      originalError: body,
      requestId: body?.requestId,
      stage: body?.stage,
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
