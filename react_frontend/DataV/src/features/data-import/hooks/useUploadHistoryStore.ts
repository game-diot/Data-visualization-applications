// src/app/store/useUploadHistoryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileUploadResponse } from '@/features/data-import/types';

interface UploadHistoryState {
	history: FileUploadResponse[];
	addRecord: (record: FileUploadResponse) => void;
	deleteRecord: (id: string) => void;
	loadHistory: () => void;
}

export const useUploadHistoryStore = create<UploadHistoryState>()(
	persist(
		(set) => ({
			history: [],

			addRecord: (record) => {
				set((state) => ({
					history: [record, ...state.history].slice(0, 20), // 只保留20条
				}));
			},

			deleteRecord: (id) => {
				set((state) => ({
					history: state.history.filter((r) => r._id !== id),
				}));
			},

			loadHistory: () => {
				// 可选：从 localStorage 加载（如果需要兼容旧数据）
			},
		}),
		{ name: 'upload-history' },
	),
);
