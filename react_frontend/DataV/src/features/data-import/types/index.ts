//数据集预览数据结构
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
//上传文件接口返回数据结构
export interface FileUploadResponse {
	originName: string;
	storedName: string;
	path: string;
	size: number;
	type: string;
	format: string;
	uploadTime: string;
	status: string;
	description: string;
	tags: string[];
	_id: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}
