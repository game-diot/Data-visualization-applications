import { uploadClient } from '@/api/uploadClient';

export async function uploadFileToServer(file: File) {
	try {
		const formData = new FormData();
		formData.append('file', file);

		const response = await uploadClient.post('', formData, {
			headers: { 'Content-type': 'multipart/form-data' },
		});
		return response.data;
	} catch (error) {
		console.error(`[uploadFileToServer]${error}`);
		throw error;
	}
}
