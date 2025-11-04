import { apiClient } from '@/api/index';
//上传文件接口，调用axios实例，返回响应
export async function uploadFileToServer(file: File) {
	try {
		const formData = new FormData();
		formData.append('file', file);

		const response = await apiClient.post('/files/upload', formData, {
			headers: { 'Content-type': 'multipart/form-data' },
			responseType: 'json',
		});

		return response;
	} catch (error) {
		console.error(`[uploadFileToServer]${error}`);
		throw error;
	}
}
