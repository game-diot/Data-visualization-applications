export interface UploadResponse {
	id: string;
	fileName: string;
	fileUrl: string;
	success: boolean;
	message?: string;
	meta?: FileMeta;
	createdAt?: string;
}
export interface FileMeta {
	size: number;
	mimeType?: string;
	hash?: string;
}

export interface UploadHistoryItem {
	id: string;
	fileName: string;
	fileUrl?: string;
	status: UploadStatus;
	message?: string;
	createdAt: string;
	meta?: FileMeta;
}
export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed' | 'cancelled';

export interface UploadRequestOptions {
	file: File;
	onProgress?: (percent: number) => void;
	fields?: Record<string, string | Blob | number>;
	overwrite?: boolean;
}

export interface PaginationParams {
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}

export interface ApiError {
	code?: number | string;
	message: string;
	details?: any;
}
