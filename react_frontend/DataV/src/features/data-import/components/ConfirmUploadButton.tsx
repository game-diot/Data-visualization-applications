// src/components/ConfirmUploadButton.tsx
import { useFileUpload } from '../store/useFileUpload';
import { uploadFileToServer } from '../api/uploadFile';
import { useImportHistory, type HistoryRecord } from '../store/useImportHistory';
// src/components/ConfirmUploadButton.tsx
export const ConfirmUploadButton = () => {
	const { file, setStatus, setUploadProgress, setDatasetInfo, status } = useFileUpload();
	const { addHistoryRecord } = useImportHistory();

	const handleUpload = async () => {
		if (!file) return;

		try {
			setStatus('uploading');
			const result = await uploadFileToServer(file, setUploadProgress);

			// 详细调试
			console.log('=== API 响应调试 ===');
			console.log('typeof result:', typeof result);
			console.log('result:', result);
			console.log('result keys:', Object.keys(result || {}));

			if (result?.data) {
				console.log('result.data:', result.data);
				console.log('result.data keys:', Object.keys(result.data || {}));
			}

			if (result?.data?.meta) {
				console.log('result.data.meta:', result.data.meta);
			}
			console.log('=== 调试结束 ===');

			// 暂时使用文件信息创建记录
			const historyRecord: HistoryRecord = {
				id: crypto.randomUUID(),
				name: file.name,
				size: file.size,
				type: file.type,
				uploadTime: new Date().toISOString(),
				stage: 'uploaded',
			};

			console.log('添加历史记录:', historyRecord);
			addHistoryRecord(historyRecord);

			// 尝试设置 datasetInfo（如果存在）
			if (result?.data?.meta) {
				setDatasetInfo(result.data.meta);
			} else if (result?.data) {
				setDatasetInfo(result.data);
			}

			setStatus('success');
		} catch (err) {
			console.error('上传失败', err);
			setStatus('error');
		}
	};

	return (
		<button
			onClick={handleUpload}
			disabled={status === 'uploading'}
			className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
		>
			{status === 'uploading' ? '正在上传...' : '确认上传'}
		</button>
	);
};
