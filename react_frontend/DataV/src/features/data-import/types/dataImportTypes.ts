export interface DatasetInfo {
	id: string;
	name: string;
	size: number;
	type: string;
	rowCount?: number;
	columnCount?: number;
	uploadtime?: string;
}

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

export interface UploadResponse {
	meta: {
		id: string;
		name: string;
		size: number;
		type: string;
		totalRows: number;
		totalCols: number;
		uploadTime: string;
	};
	previewRows: unknown[];
}
