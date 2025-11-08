// src/api/deleteFileUploadRecord.ts
import { apiClient } from '@/api/index';

export const deleteFileRecord = async (id: string) => {
	try {
		const response = await apiClient.delete(`/files/${id}`);
		return response;
	} catch (error) {
		console.error(`[deleteFileRecord] ${error}`);
		throw error;
	}
};
