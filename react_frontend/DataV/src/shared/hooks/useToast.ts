// src/shared/hooks/useToast.ts
import { message } from 'antd';

export const useToast = () => {
	const success = (msg: string) => message.success(msg);
	const error = (msg: string) => message.error(msg);
	const info = (msg: string) => message.info(msg);
	const warning = (msg: string) => message.warning(msg);

	return { success, error, info, warning };
};
