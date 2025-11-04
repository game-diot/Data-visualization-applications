import { createApiClient } from './apiClient';
import { NODE_API_BASE_URL } from '@/shared/constants/api';

// 后端统一使用 code = 200 表示成功
export const apiClient = createApiClient({
	baseURL: NODE_API_BASE_URL,
	timeout: 15000,
	withCredentials: true,
});
