// src/lib/utils.ts
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - className 合并函数
 * 自动去重、合并 Tailwind 冲突样式
 */
export function cn(...inputs: unknown[]) {
	return twMerge(clsx(inputs));
}
