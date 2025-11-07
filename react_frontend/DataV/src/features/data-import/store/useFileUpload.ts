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
	setFile: (file: File) => void;
	setPreviewData: (data: PreviewData | null) => void;
	setDatasetInfo: (info: DatasetInfo) => void;
	setStatus: (status: UploadStatus) => void;
}

export const useFileUpload = create<FileUploadState>((set) => ({
	file: null,
	previewData: null,
	datasetInfo: null,
	status: 'idle',
	uploadProgress: 0,
	setUploadProgress: (p) => set({ uploadProgress: p }),
	setFile: async (file) => {
		const validation = validateFile(file);
		if (!validation.valid) {
			message.error(validation.message);
			set({ status: 'error' });
			return;
		}

		set({ file, status: 'parsing' });

		try {
			let parsed;
			if (file.name.endsWith('.csv')) parsed = await parseCSV(file);
			else parsed = await parseExcel(file);

			const datasetInfo = {
				id: crypto.randomUUID(),
				name: file.name,
				size: file.size,
				type: file.type,
				columnCount: parsed.headers.length,
				rowCount: parsed.rows.length,
				uploadTime: new Date().toISOString(),
			};

			set({
				previewData: { headers: parsed.headers, rows: parsed.rows },
				datasetInfo,
				status: 'parsed',
			});
		} catch (error) {
			message.error(`文件解析失败，请检查文件内容,${error}`);
			set({ status: 'error' });
		}
	},

	setPreviewData: (data) => set({ previewData: data }),
	setDatasetInfo: (info) => set({ datasetInfo: info }),
	setStatus: (status) => set({ status }),
}));
