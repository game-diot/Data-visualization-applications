import { Logger } from './logger';
import { handleError } from './errorHandle';
export const setupGlobalErrorHandler = () => {
	// 1. 运行时错误 (同步)
	window.onerror = (msg, src, line, col, error) => {
		// 先用 Logger 记录详细信息 (通常用于发送到服务端)
		Logger.error('JS Runtime Error', { msg, src, line, col, error });

		// 再调用 handleError 来进行用户友好的 toast 提示
		if (error) {
			handleError(error);
		} else {
			handleError(new Error(msg.toString()));
		}

		return false;
	};

	// 2. Promise 错误 (异步)
	window.onunhandledrejection = (event) => {
		// 先用 Logger 记录详细信息
		Logger.error('UnHandled Promise Rejection', { reason: event.reason, event });
		// 再调用 handleError 来进行用户友好的 toast 提示
		handleError(event.reason);
	};
};
