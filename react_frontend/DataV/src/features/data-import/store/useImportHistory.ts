// src/store/useImportHistory.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileMeta } from '../types/dataImportTypes';

export type ImportStage = 'uploaded' | 'parsed' | 'processed' | 'result';

export type HistoryRecord = Pick<
	FileMeta,
	'id' | 'name' | 'size' | 'type' | 'uploadTime' | 'stage'
>;

interface ImportHistoryState {
	history: HistoryRecord[];
	addHistoryRecord: (record: HistoryRecord) => void;
	removeHistoryRecord: (id: string) => void;
	updateHistoryStage: (id: string, stage: ImportStage) => void;
	clearHistory: () => void;
}

/** type guard：检查对象是否为有效 HistoryRecord */
const isValidHistoryRecord = (obj: unknown): obj is HistoryRecord => {
	if (!obj || typeof obj !== 'object') return false;

	const record = obj as Record<string, unknown>;
	const { id, name, size, type, uploadTime, stage } = record;

	const validStage = ['uploaded', 'parsed', 'processed', 'result'];

	return (
		typeof id === 'string' &&
		id.length > 0 &&
		typeof name === 'string' &&
		name.length > 0 &&
		typeof size === 'number' &&
		typeof type === 'string' &&
		typeof uploadTime === 'string' &&
		typeof stage === 'string' &&
		validStage.includes(stage)
	);
};

/** 清洗历史数组：保留有效项并去重（按 id） */
const sanitizeHistory = (arr: unknown[]): HistoryRecord[] => {
	if (!Array.isArray(arr)) return [];

	const map = new Map<string, HistoryRecord>();
	for (const item of arr) {
		if (isValidHistoryRecord(item)) {
			// Normalize uploadTime to ISO string
			try {
				const record: HistoryRecord = {
					...item,
					uploadTime: new Date(item.uploadTime).toISOString(),
				};
				map.set(record.id, record);
			} catch (error) {
				console.warn('[sanitizeHistory] 跳过无效时间格式的记录:', item, error);
			}
		}
	}
	return Array.from(map.values());
};

const STORAGE_KEY = 'importHistory';

export const useImportHistory = create<ImportHistoryState>()(
	persist(
		(set) => ({
			// 只需要设置默认值，persist 会自动处理恢复
			history: [],

			addHistoryRecord: (record) => {
				if (!isValidHistoryRecord(record)) {
					console.warn('[useImportHistory] 忽略非法记录', record);
					return;
				}

				set((state) => {
					// 先过滤掉 null/undefined，确保数组干净
					const validHistory = state.history.filter(
						(r): r is HistoryRecord => r !== null && r !== undefined && isValidHistoryRecord(r),
					);

					// 检查是否已存在
					if (validHistory.some((r) => r.id === record.id)) {
						console.log('[useImportHistory] 记录已存在，跳过添加');
						return { history: validHistory }; // 返回清洗后的数组
					}

					return { history: [...validHistory, record] };
				});
			},

			removeHistoryRecord: (id) => {
				set((state) => ({
					history: state.history.filter((r) => r !== null && r !== undefined && r.id !== id),
				}));
			},

			updateHistoryStage: (id, stage) => {
				set((state) => ({
					history: state.history
						.filter((r): r is HistoryRecord => r !== null && r !== undefined)
						.map((r) => (r.id === id ? { ...r, stage } : r)),
				}));
			},

			clearHistory: () => {
				set({ history: [] });
			},
		}),
		{
			name: STORAGE_KEY,
			// 添加数据验证和清洗
			migrate: (persistedState: unknown) => {
				console.log('[persist migrate] 原始状态:', persistedState);

				if (persistedState && typeof persistedState === 'object' && 'history' in persistedState) {
					const state = persistedState as { history: unknown };
					if (Array.isArray(state.history)) {
						const cleaned = sanitizeHistory(state.history);
						console.log('[persist migrate] 清洗后状态:', cleaned);
						return {
							...state,
							history: cleaned,
						} as ImportHistoryState;
					}
				}

				// 如果数据格式不对，返回空状态
				return { history: [] } as unknown as ImportHistoryState;
			},
			// 在持久化之前验证数据
			partialize: (state) => ({
				history: sanitizeHistory(state.history),
			}),
		},
	),
);
