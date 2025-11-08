import { apiClient } from '@/api/index';

export const uploadFileToServer = async (file: File, onProgress?: (progress: number) => void) => {
	try {
		const formData = new FormData();
		formData.append('file', file);

		const response = await apiClient.post('/files/upload', formData, {
			headers: { 'Content-type': 'multipart/form-data' },
			responseType: 'json',
			onUploadProgress: (e) => {
				if (onProgress && e.total) {
					const progress = Math.round((e.loaded / e.total) * 100);
					onProgress(progress);
				}
			},
		});

		return response;
	} catch (error) {
		console.error(`[uploadFileToServer]${error}`);
		throw error;
	}
};
