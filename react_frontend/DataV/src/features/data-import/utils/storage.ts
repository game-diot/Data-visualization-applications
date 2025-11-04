// src/features/data-import/utils/storage.ts
import { type FileUploadResponse } from '../types';
const STORAGE_KEY = 'upload_history';

export function saveUploadHistory(record: FileUploadResponse) {
	const history = getUploadHistory();
	history.unshift(record);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); // 只保留20条
}

export function getUploadHistory(): FileUploadResponse[] {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	} catch {
		return [];
	}
}

export function deleteUploadRecord(storedName: string) {
	const history = getUploadHistory().filter((r) => r.storedName !== storedName);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
