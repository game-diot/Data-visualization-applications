// actions/saveDataset.ts
import axios from 'axios';
import { useFileUpload } from '../store/useFileUpload';
import { useImportHistory } from '../store/useImportHistory';

export const saveDataset = async () => {
	const { file, setStatus, setDatasetInfo } = useFileUpload.getState();
	const { addHistoryRecord } = useImportHistory.getState();

	if (!file) return;

	try {
		setStatus('uploading');
		const formData = new FormData();
		formData.append('file', file);

		const res = await axios.post('/api/files/upload', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
			onUploadProgress: (e) => {
				console.log(`上传进度: ${(e.loaded / e.total!) * 100}%`);
			},
		});

		const { meta } = res.data;
		setDatasetInfo(meta);
		addHistoryRecord(meta);
		setStatus('confirmed');
	} catch (error) {
		console.error(error);
		setStatus('error');
	}
};
