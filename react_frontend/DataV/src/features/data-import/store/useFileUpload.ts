// src/stores/useFileUpload.ts
import { create } from 'zustand';
import { type DatasetInfo, type UploadStatus, type PreviewData } from '../types/dataImportTypes';
import { validateFile } from '../utils/validateFile';
import { parseCSV } from '../utils/parseCSV';
import { parseExcel } from '../utils/parseExcel';
import { message } from 'antd';

interface FileUploadState {
	file: File | null;
	previewData: PreviewData | null;
	datasetInfo: DatasetInfo | null;
	status: UploadStatus;
	uploadProgress: number;

	setUploadProgress: (p: number) => void;
	setFile: (file: File) => Promise<PreviewData | null>; // ✅ 返回解析结果
	setPreviewData: (data: PreviewData | null) => void;
	setDatasetInfo: (info: DatasetInfo) => void;
	setStatus: (status: UploadStatus) => void;
	reset: () => void;
}

export const useFileUpload = create<FileUploadState>((set) => ({
	file: null,
	previewData: null,
	datasetInfo: null,
	status: 'idle',
	uploadProgress: 0,

	setUploadProgress: (p) => set({ uploadProgress: p }),

	// ✅ 只负责本地解析和预览，不生成 _id
	setFile: async (file) => {
		const validation = validateFile(file);
		if (!validation.valid) {
			message.error(validation.message);
			set({ status: 'error' });
			return null;
		}

		set({ file, status: 'parsing' });

		try {
			let parsed;
			if (file.name.endsWith('.csv')) parsed = await parseCSV(file);
			else parsed = await parseExcel(file);

			set({
				previewData: { headers: parsed.headers, rows: parsed.rows },
				status: 'parsed',
			});

			return parsed; // ✅ 返回解析结果供外部使用
		} catch (error) {
			message.error(`文件解析失败，请检查文件内容: ${error}`);
			set({ status: 'error' });
			return null;
		}
	},

	setPreviewData: (data) => set({ previewData: data }),
	setDatasetInfo: (info) => set({ datasetInfo: info }),
	setStatus: (status) => set({ status }),
	reset: () =>
		set({
			file: null,
			previewData: null,
			datasetInfo: null,
			status: 'idle',
			uploadProgress: 0,
		}),
}));
