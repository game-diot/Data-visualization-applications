import { useMemo } from 'react'
import { useSearch } from '@tanstack/react-router'
import type { z } from 'zod'

import { router } from '@/app/router'

type UseQueryFiltersOptions<T> = {
  resetPageOnFilterChange?: boolean
  defaultFilters: T
}

export function useQueryFilters<TSchema extends z.ZodTypeAny>(
  routeId: string,
  schema: TSchema,
  options: UseQueryFiltersOptions<z.infer<TSchema>>,
) {
  const rawSearch = useSearch({ strict: false }) as unknown

  const filters = useMemo(() => {
    const parsed = schema.safeParse(rawSearch)
    return parsed.success ? parsed.data : options.defaultFilters
  }, [rawSearch, schema, options.defaultFilters])

  // ✅ 关键：把 navigate 断言成 any（只在这里断开类型链）
  const navigateAny = router.navigate as any

  const updateFilters = (newFilters: Partial<z.infer<TSchema>> & Record<string, any>) => {
    const resetPageOnFilterChange = options.resetPageOnFilterChange ?? true
    const shouldResetPage =
      resetPageOnFilterChange && !Object.prototype.hasOwnProperty.call(newFilters, 'page')

    const next: Record<string, any> = {
      ...(filters as any),
      ...newFilters,
      ...(shouldResetPage ? { page: 1 } : {}),
    }

    // 约定：null 表示删除该 query 参数
    Object.keys(next).forEach((k) => {
      if (next[k] === null) delete next[k]
    })

    navigateAny({
      to: routeId,
      search: next, // ✅ 现在不会再被限制为 true | reducer
      replace: true,
    })
  }

  const resetFilters = () => {
    navigateAny({
      to: routeId,
      search: options.defaultFilters,
      replace: true,
    })
  }

  return { filters, updateFilters, resetFilters }
}
