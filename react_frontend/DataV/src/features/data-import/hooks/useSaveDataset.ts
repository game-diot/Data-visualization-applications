// hooks/useSaveDataset.ts
import { uploadFileToServer } from '../api/uploadFileToServer';
import { useFileUpload } from '../store/useFileUpload';
import { useImportHistory, type HistoryRecord } from '../store/useImportHistory';
import { message } from 'antd';
import { type PreviewRow, type UploadResponse } from '../types/dataImportTypes';

export const useSaveDataset = () => {
	const { file, setStatus, setUploadProgress, setDatasetInfo, setPreviewData } = useFileUpload();
	const { addHistoryRecord } = useImportHistory();

	const saveDataset = async () => {
		if (!file) return message.info('还未导入待分析数据');

		try {
			setStatus('uploading');
			const result = await uploadFileToServer(file, setUploadProgress);

			console.log('API 返回:', result);
			const { meta, previewRows } = result.data as UploadResponse;

			setDatasetInfo(meta);
			const rowsArray = Array.isArray(previewRows) ? previewRows : [];

			const mappedRows: PreviewRow[] = rowsArray.map((row) => {
				if (Array.isArray(row)) {
					// 如果 row 是数组，使用索引生成 key
					return row.reduce((acc, value, idx) => {
						acc[`col${idx + 1}`] = value;
						return acc;
					}, {} as PreviewRow);
				}
				if (typeof row === 'object' && row !== null) {
					return row as PreviewRow;
				}
				return {};
			});

			setPreviewData({
				headers: mappedRows.length > 0 ? Object.keys(mappedRows[0]) : [],
				rows: mappedRows,
			});

			const historyRecord: HistoryRecord = {
				id: crypto.randomUUID(),
				name: file.name,
				size: file.size,
				type: file.type,
				uploadTime: new Date().toISOString(),
				stage: 'uploaded',
			};

			addHistoryRecord(historyRecord);

			setStatus('success');
			message.success('上传成功');
		} catch (err) {
			console.error('上传失败', err);
			setStatus('error');
			message.error('上传失败');
		}
	};

	return { saveDataset };
};
