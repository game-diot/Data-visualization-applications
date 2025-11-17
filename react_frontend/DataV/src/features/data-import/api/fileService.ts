// src/services/file.service.ts
import { apiClient } from '@/api/index';

export const fileService = {
	/**
	 * 上传文件到后端（获取后端 _id）
	 */
	async uploadFile(file: File, onProgress?: (progress: number) => void) {
		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await apiClient.post('/files/upload', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
				onUploadProgress: (e) => {
					if (onProgress && e.total) {
						const progress = Math.round((e.loaded / e.total) * 100);
						onProgress(progress);
					}
				},
			});

			return response.data.data; // 返回后端的 meta 数据（包含 _id）
		} catch (error) {
			console.error('[fileService.uploadFile]', error);
			throw error;
		}
	},

	/**
	 * 查询文件质量检测结果
	 */
	async getQualityResult(fileId: string) {
		try {
			const response = await apiClient.get(`/files/${fileId}/quality`);
			return response.data.data;
		} catch (error) {
			console.error('[fileService.getQualityResult]', error);
			throw error;
		}
	},

	/**
	 * 获取文件列表
	 */
	async getFiles(page = 1, limit = 10) {
		try {
			const response = await apiClient.get('/files', { params: { page, limit } });
			return response.data.data;
		} catch (error) {
			console.error('[fileService.getFiles]', error);
			throw error;
		}
	},

	/**
	 * 删除文件
	 */
	async deleteFile(id: string) {
		try {
			const response = await apiClient.delete(`/files/${id}`);
			return response.data;
		} catch (error) {
			console.error('[fileService.deleteFile]', error);
			throw error;
		}
	},
};
