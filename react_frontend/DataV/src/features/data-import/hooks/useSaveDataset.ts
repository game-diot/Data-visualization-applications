import { uploadFileToServer } from '../api/uploadFileToServer';
import { useFileUpload } from '../store/useFileUpload';
import { message } from 'antd';
import { type PreviewRow, type UploadResponse } from '../types/dataImportTypes';
import { useImportHistory } from '../store/useImportHistory';

export const useSaveDataset = () => {
	const { file, setStatus, setUploadProgress, setDatasetInfo, setPreviewData } = useFileUpload();

	const { fetchHistory } = useImportHistory(); // ✅ 上传后自动刷新历史记录

	const saveDataset = async () => {
		if (!file) {
			message.info('还未导入待分析数据');
			return;
		}

		try {
			setStatus('uploading');
			const result = await uploadFileToServer(file, setUploadProgress);

			console.log('API 返回:', result);
			const { meta, previewRows } = result.data as UploadResponse;

			// 设置文件基本信息
			setDatasetInfo(meta);

			// 构建预览数据
			const rowsArray = Array.isArray(previewRows) ? previewRows : [];
			const mappedRows: PreviewRow[] = rowsArray.map((row) => {
				if (Array.isArray(row)) {
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

			setStatus('success');
			message.success('上传成功');

			// ✅ 上传成功后刷新文件历史列表
			await fetchHistory(1, 10);
		} catch (err) {
			console.error('上传失败', err);
			setStatus('error');
			message.error('上传失败');
		}
	};

	return { saveDataset };
};
