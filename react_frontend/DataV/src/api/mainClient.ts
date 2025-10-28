import axios, {
	type AxiosInstance,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
	type AxiosError,
} from 'axios';
import { message } from 'antd';
import { useAppStore } from '@/app/store';
import { FASTAPI_API_BASE_URL, ERROR_CODE_SUCCESS } from '@/shared/constants/api';
import { handleError } from '@/shared/utils/errorHandle';
import { Logger } from '@/shared/utils/logger';

interface ApiResponse<T = unknown> {
	code: number;
	data: T;
	msg: string;
}

const mainClient: AxiosInstance = axios.create({
	baseURL: FASTAPI_API_BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

mainClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		const token = useAppStore.getState().token;

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => {
		Logger.error('[Main Client Request Error]', error);
		return Promise.reject(error);
	},
);

mainClient.interceptors.response.use(
	(response: AxiosResponse<ApiResponse>) => {
		const { data } = response;

		if (data && data.code !== ERROR_CODE_SUCCESS) {
			const errorMsg = data.msg || '业务请求异常';
			message.warning(errorMsg);

			const businessError = new Error(errorMsg) as Error & { code: number };
			businessError.code = data.code;

			Logger.warn('[Main Client Business Error]', businessError);
			handleError(businessError);

			return Promise.reject(businessError);
		}

		return response;
	},

	(error: AxiosError<ApiResponse>) => {
		if (error.response) {
			const { status, data } = error.response;
			const msg = data?.msg || `请求失败 (${status})`;

			switch (status) {
				case 401:
					message.error('未授权或登录已过期，请重新登录');
					useAppStore.getState().setToken(null);
					window.location.href = '/login';
					break;
				case 404:
					message.error('请求接口不存在 (404)');
					break;
				case 500:
					message.error('服务器内部错误 (500)');
					break;
				default:
					message.error(msg);
			}

			Logger.error('[Main Client HTTP Error]', error.response);
			handleError(error);
		} else if (error.request) {
			message.error('网络连接失败或请求超时');
			Logger.error('[Main Client Network Error]', error.request);
			handleError(error);
		} else {
			message.error('客户端配置错误');
			Logger.error('[Main Client Config Error]', error.message);
			handleError(error);
		}

		return Promise.reject(error);
	},
);

export default mainClient;
