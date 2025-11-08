import { apiClient } from '@/api/index';

export const getFileUploadRecords = async (page = 1, limit = 10) => {
	try {
		const response = await apiClient.get('/files', { params: { page, limit } });
		return response;
	} catch (error) {
		console.error(`[uploadFileToServer]${error}`);
		throw error;
	}
};
