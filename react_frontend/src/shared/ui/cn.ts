import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 智能合并 Tailwind 类名
 * 解决条件渲染和样式覆盖冲突（后面的类名能正确覆盖前面的类名）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
