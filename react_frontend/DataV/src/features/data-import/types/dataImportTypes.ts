export type DatasetInfo = Pick<
	FileMetaResponse,
	'_id' | 'name' | 'size' | 'type' | 'uploadTime' | 'stage'
> & {
	rowCount?: number;
	columnCount?: number;
};

export type UploadStatus =
	| 'idle'
	| 'uploading'
	| 'parsing'
	| 'parsed'
	| 'confirmed'
	| 'persisted'
	| 'success'
	| 'error';

export interface PreviewRow {
	[key: string]: string | number | null;
}
export interface PreviewData {
	headers: string[];
	rows: PreviewRow[];
}
export interface ImportState {
	file: File | null;
	previewData: PreviewData | null;
	datasetinfo: DatasetInfo | null;
	status: UploadStatus;
}
export interface FileMeta {
	id: string;
	name: string;
	storedName: string;
	path: string;
	size: number;
	type: string;
	totalRows: number;
	totalCols: number;
	uploadTime: string;
	stage: 'uploaded' | 'parsed' | 'processed' | 'result';
}
export interface FileMetaResponse {
	_id: string; // 数据库主键
	name: string;
	storedName: string;
	path: string;
	size: number;
	type: string;
	totalRows: number;
	totalCols: number;
	uploadTime: string;
	stage: 'uploaded' | 'parsed' | 'processed' | 'result';
}

export interface UploadResponse {
	meta: FileMetaResponse;
	previewRows: unknown[];
}

export interface FileListResponse {
	total: number;
	page: number;
	limit: number;
	records: FileMeta[];
}
