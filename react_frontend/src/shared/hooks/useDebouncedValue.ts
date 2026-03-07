// src/shared/hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// 兼容旧命名
export const useDebounce = useDebouncedValue
