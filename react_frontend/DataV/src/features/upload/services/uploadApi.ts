// src/features/upload/services/uploadApi.ts
import apiClient, { uploadWithProgress } from '../../../api/uploadClient.js';
import type {
	UploadResponse,
	UploadHistoryItem,
	PaginationParams,
	PaginatedResult,
	UploadRequestOptions,
} from '../types/upload';

/**
 * 上传文件
 * @param options - 包含 File、进度回调、额外表单字段等
 */
export async function uploadFile(options: UploadRequestOptions): Promise<UploadResponse> {
	const { file, onProgress, fields } = options;

	const formData = new FormData();
	formData.append('file', file);

	// 附加额外字段（如用户ID、备注信息等）
	if (fields) {
		Object.entries(fields).forEach(([key, value]) => {
			formData.append(key, String(value));
		});
	}

	// 调用通用上传函数（支持进度显示）
	const result = await uploadWithProgress<UploadResponse>('/upload', formData, onProgress);

	return result;
}

/**
 * 获取上传历史（带分页）
 * @param params - 分页参数，可选
 */
export async function getUploadHistory(
	params?: PaginationParams,
): Promise<PaginatedResult<UploadHistoryItem>> {
	const response = await apiClient.get<PaginatedResult<UploadHistoryItem>>('/uploads', {
		params,
	});

	return response.data;
}

/**
 * 删除上传记录
 */
export async function deleteUploadRecord(id: string): Promise<{ success: boolean }> {
	const response = await apiClient.delete<{ success: boolean }>(`/uploads/${id}`);
	return response.data;
}
