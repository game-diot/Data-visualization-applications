import { QueryCache, MutationCache, QueryClient } from '@tanstack/react-query'

import { logger } from '@/monitoring/logger'
import { normalizeError } from '@/shared/utils/normalizeError'
// 如果你已经有统一 notify 工具，建议用它；没有的话先留空或用 antd message 在 app 层实现
import { notifyError } from '@/shared/utils/notify'
import type { DefaultError } from '@tanstack/react-query'
const shouldSilent = (meta: unknown) =>
  !!meta && typeof meta === 'object' && 'silent' in (meta as any) && (meta as any).silent === true

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (shouldSilent(query.meta)) return
        const vm = normalizeError(error, 'api')
        logger.error('ReactQueryQueryError', vm)
        notifyError(vm.title, vm.message)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (shouldSilent(mutation.meta)) return
        const vm = normalizeError(error, 'api')
        logger.error('ReactQueryMutationError', vm)
        notifyError(vm.title, vm.message)
      },
    }),
    defaultOptions: {
      queries: {
        // 普通查询可重试 1 次；轮询/静默请求通过 meta.silent 控制为 0
        retry: (failureCount: number, _error: DefaultError) => failureCount < 1,
        refetchOnWindowFocus: false,
        staleTime: 10 * 1000,
        gcTime: 10 * 60 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  })

// 默认导出单例（应用用它）
export const queryClient = createQueryClient()
