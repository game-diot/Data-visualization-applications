import axios, {
	type AxiosInstance,
	AxiosError,
	type InternalAxiosRequestConfig,
	type AxiosResponse,
} from 'axios';
import { message } from 'antd';
import { useAppStore } from '@/app/store';
import { Logger } from '@/shared/utils/logger';

// ========== 通用响应结构 ==========
export interface ApiResponse<T = unknown> {
	code: number; // 状态码（200 表示成功）
	msg: string; // 提示信息
	data: T; // 业务数据
}

// ========== 工厂配置项 ==========
export interface ClientConfig {
	baseURL: string;
	timeout?: number;
	withCredentials?: boolean;
}

/**
 * 创建统一的 axios 实例（适用于 Node.js / FastAPI）
 */
export function createApiClient(config: ClientConfig): AxiosInstance {
	const client = axios.create({
		baseURL: config.baseURL,
		timeout: config.timeout ?? 10000,
		withCredentials: config.withCredentials ?? false,
	});

	// ========== 请求拦截器 ==========
	client.interceptors.request.use(
		(requestConfig: InternalAxiosRequestConfig) => {
			try {
				const token = useAppStore.getState().token;
				requestConfig.headers = requestConfig.headers ?? {};

				// 携带 Token
				if (token) {
					(requestConfig.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
				}

				// 如果是 FormData，让浏览器自动设置 multipart/form-data; boundary=...
				if (requestConfig.data instanceof FormData) {
					delete (requestConfig.headers as Record<string, string>)['Content-Type'];
				}
			} catch (err) {
				Logger.warn('[Request Interceptor Warning]', err);
			}

			return requestConfig;
		},
		(error: AxiosError) => {
			Logger.error('[Request Error]', error);
			return Promise.reject(error);
		},
	);

	// ========== 响应拦截器 ==========
	client.interceptors.response.use(
		// ✅ 成功响应处理
		(response: AxiosResponse<ApiResponse<unknown>>) => {
			const payload = response.data;

			// 检查返回格式
			if (!payload || typeof payload !== 'object') {
				const err = new Error('服务器响应格式错误');
				message.error(err.message);
				throw err;
			}

			// 判断业务状态码是否成功
			if (payload.code !== 200) {
				const errorMsg = payload.msg ?? '请求失败';
				message.error(errorMsg);

				const businessError = new Error(errorMsg) as Error & { code?: number };
				businessError.name = 'BusinessError';
				businessError.code = payload.code;

				Logger.warn('[Business Error]', { code: payload.code, msg: errorMsg });
				throw businessError;
			}

			// ✅ 返回真正的业务数据 data
			return {
				...response,
				data: payload, // payload 是 { code, msg, data }
			};
		},

		// ❌ 错误响应处理（HTTP 层 / 网络错误）
		(error: AxiosError<unknown>) => {
			if (error.response) {
				const status = error.response.status;
				const respData = (error.response.data ?? {}) as { msg?: string; message?: string };
				const msg = respData.msg ?? respData.message ?? `服务器错误 (${status})`;

				switch (status) {
					case 401:
						message.error('登录已过期，请重新登录');
						useAppStore.getState().setToken(null);
						window.location.href = '/login';
						break;
					case 403:
						message.error('无权限访问');
						break;
					case 404:
						message.error('请求接口不存在');
						break;
					case 500:
						message.error('服务器内部错误');
						break;
					default:
						message.error(msg);
				}

				Logger.error('[HTTP Error]', {
					status,
					data: error.response.data,
					headers: error.response.headers,
				});
			} else if (error.request) {
				message.error('网络连接失败或服务器无响应');
				Logger.error('[Network Error]', error.request);
			} else {
				message.error('请求配置错误');
				Logger.error('[Config Error]', error.message);
			}

			return Promise.reject(error);
		},
	);

	return client;
}
