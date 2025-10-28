// 1. 从环境变量中获取主 API 的 Base URL
// 假设这是您的主要后端服务地址
export const FASTAPI_API_BASE_URL: string =
	import.meta.env.VITE_FASTAPI_API_BASE_URL || 'http://localhost:8080/api';

// 2. 从环境变量中获取 Node/上传 API 的 Base URL
// 假设这是您的Node.js服务或文件上传服务地址
export const NODE_API_BASE_URL: string =
	import.meta.env.VITE_NODEJS_API_BASE_URL || 'http://localhost:5000/api';

// 3. 常见的 API 路径常量 (示例)
// 在这里集中管理所有接口路径，确保 api client 引用时使用这些常量。

// 认证相关
export const API_LOGIN = '/auth/login';
export const API_REFRESH_TOKEN = '/auth/refresh';

// 用户相关
export const API_GET_USER_INFO = '/user/info';
export const API_UPDATE_PROFILE = '/user/profile';

// 数据/图表相关
export const API_FETCH_DATASETS = '/data/datasets';
export const API_GET_CHART_DATA = '/data/chart';

// 文件上传路径
export const API_UPLOAD_FILE = '/files/upload';

// 4. 常见的业务错误码 (如果后端有统一规范)
export const ERROR_CODE_SUCCESS = 0;
export const ERROR_CODE_TOKEN_INVALID = 401;
export const ERROR_CODE_VALIDATION_FAILED = 400;

// 🚨 注意：为了兼容您之前提供的代码 (使用 API.BASE_URL)，
// 我们可以将所有常量打包成一个对象导出 (可选，但推荐使用具名导出)
export const API = {
	FASTAPI_BASE_URL: FASTAPI_API_BASE_URL,
	NODE_BASE_URL: NODE_API_BASE_URL,
	LOGIN: API_LOGIN,
	GET_USER_INFO: API_GET_USER_INFO,
	// ... 其他路径
};
