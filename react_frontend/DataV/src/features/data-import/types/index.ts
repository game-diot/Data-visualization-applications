//上传文件元信息
export interface FileMeta {
	name: string;
	size: number;
	type: string;
	lastModified: number;
}
//数据集基础信息
export interface DatasetInfo {
	id: string;
	name: string;
	rowCount: number;
	columnCount: number;
	uploadTime: string; //ISO时间字符串
}
//模块状态结构
export interface ImportState {
	currentFile: File | null;
	parsedData: Record<string, unknown>[];
	datasetInfo: DatasetInfo | null;
	loading: boolean;
	error?: string;
}
