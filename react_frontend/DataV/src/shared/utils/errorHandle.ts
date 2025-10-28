import { toast } from 'react-toastify';

export class AppError extends Error {
	code?: number;
	constructor(message: string, code?: number) {
		super(message);
		this.name = 'AppError';
		this.code = code;
	}
}

export const handleError = (error: unknown) => {
	if (error instanceof AppError) {
		toast.error(error.message);
		console.error(`[AppError] ${error.code || ''}:${error.message}`);
	} else if (error instanceof Error) {
		toast.error(error.message);
		console.error(`[Error] ${error.message}`);
	} else {
		toast.error('发生未知错误');
		console.error(`[Unknown Error]`, error);
	}
};
