import { create } from 'zustand';
import { getFileUploadRecords } from '../api/getFileUploadRecords';
import { type FileMeta, type FileMetaResponse } from '../types/dataImportTypes';
import { deleteFileRecord } from '../api/deleteFileUploadRecord';
import { message } from 'antd';

export type ImportStage = 'uploaded' | 'parsed' | 'processed' | 'result';

export type HistoryRecord = Pick<
	FileMeta,
	'id' | 'name' | 'size' | 'type' | 'uploadTime' | 'stage'
>;

interface ImportHistoryState {
	history: HistoryRecord[];
	total: number;
	page: number;
	limit: number;
	loading: boolean;
	error: unknown | null;

	/** 从后端获取分页文件记录 */
	fetchHistory: (page?: number, limit?: number) => Promise<void>;
	deleteHistory: (id: string) => Promise<void>;
}

export const useImportHistory = create<ImportHistoryState>((set) => ({
	history: [],
	total: 0,
	page: 1,
	limit: 10,
	loading: false,
	error: null,

	fetchHistory: async (page = 1, limit = 10) => {
		set({ loading: true, error: null });
		try {
			const res = await getFileUploadRecords(page, limit);
			const { total, page: currentPage, limit: pageLimit, records } = res.data.data;
			// 统一格式转换：_id → id
			const normalized: FileMeta[] = records.map((item: FileMetaResponse) => ({
				id: item._id, // 映射 _id → id
				name: item.name,
				size: item.size,
				type: item.type,
				uploadTime: item.uploadTime,
				stage: item.stage,
			}));

			set({
				history: normalized,
				total,
				page: currentPage,
				limit: pageLimit,
				loading: false,
			});
		} catch (err) {
			set({
				loading: false,
				error: err ?? '获取历史记录失败',
			});
		}
	},

	deleteHistory: async (id) => {
		try {
			await deleteFileRecord(id); // 调用 API 删除
			set((state) => ({
				history: state.history.filter((record) => record.id !== id),
			}));
			message.success('删除成功');
		} catch (err) {
			console.error('删除历史记录失败', err);
			message.error('删除失败');
		}
	},
}));
