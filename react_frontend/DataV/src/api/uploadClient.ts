import axios, {
	type AxiosInstance,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
	type AxiosError,
	type AxiosRequestConfig,
	type AxiosProgressEvent,
} from 'axios';
import { message } from 'antd';
import { NODE_API_BASE_URL } from '@/shared/constants/api'; // 引入 Node API Base URL
import { handleError } from '@/shared/utils/errorHandle'; // 引入统一错误处理
import { Logger } from '@/shared/utils/logger'; // 引入 Logger

export const uploadClient: AxiosInstance = axios.create({
	baseURL: NODE_API_BASE_URL,
	timeout: 30000, // 上传可能耗时较长，增加超时时间
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

uploadClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		const token = localStorage.getItem('token');

		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		if (config.data instanceof FormData && config.headers) {
			// 浏览器会自动设置正确的 Content-Type，我们无需设置;
		}

		return config;
	},
	(error: AxiosError) => {
		Logger.error('[Upload Request Error]', error);
		return Promise.reject(error);
	},
);

uploadClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response.data;
	},
	(error: AxiosError<Error>) => {
		if (error.response) {
			const { status, data } = error.response;
			const errMsg = data?.message || `服务器错误 (${status})`;

			if (status === 401) {
				// 401 统一处理：提示并清空 Token
				message.error('登录已过期，请重新登陆');
				localStorage.removeItem('token');

				window.location.href = '/login';
			} else {
				message.error(errMsg);
			}

			Logger.error('[Upload Response Error]', error.response);
			handleError(error);
		} else if (error.request) {
			message.error('网络连接失败或服务器无响应');
			Logger.error('[Upload Network Error]', error.request);
			handleError(error);
		} else {
			message.error('请求配置错误');
			Logger.error('[Upload Config Error]', error.message);
			handleError(error);
		}

		return Promise.reject(error);
	},
);

/**
 * 封装文件上传功能，支持进度回调
 * @param url 完整的上传接口路径
 * @param data 包含文件的 FormData 对象
 * @param onProgress 进度回调函数，参数为百分比 (0-100)
 * @returns 包含响应数据的 Promise
 */
export const uploadWithProgress = async <T>(
	url: string,
	data: FormData,
	onProgress?: (percent: number) => void,
): Promise<T> => {
	// 设置上传进度回调函数和 Headers
	const config: AxiosRequestConfig = {
		headers: {
			'Content-Type': 'multipart/form-data', // 确保 Headers 正确
		},
		onUploadProgress: (progressEvent: AxiosProgressEvent) => {
			if (progressEvent.total) {
				const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
				onProgress?.(percent); // 调用传入的回调函数
			}
		},
	};

	// 使用我们创建的 uploadClient 实例发送 POST 请求
	// 由于响应拦截器已经返回了 response.data，所以这里 response 就是类型 T
	const response = await uploadClient.post<T>(url, data, config);
	return response.data;
};
