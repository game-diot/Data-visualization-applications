// src/features/data-import/utils/storage.ts

export interface UploadRecord {
	id: string;
	filename: string;
	size: number;
	type: string;
	date: string;
	url?: string; // 后端返回时可补充
}

const STORAGE_KEY = 'upload_history';

export function saveUploadRecord(record: UploadRecord) {
	const history = getUploadHistory();
	history.unshift(record);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); // 只保留20条
}

export function getUploadHistory(): UploadRecord[] {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	} catch {
		return [];
	}
}

export function deleteUploadRecord(id: string) {
	const history = getUploadHistory().filter((r) => r.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
