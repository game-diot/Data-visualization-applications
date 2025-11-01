// src/features/data-import/hooks/useImportHistory.ts
import { useState, useEffect } from 'react';
import { getUploadHistory, deleteUploadRecord, type UploadRecord } from '../utils/storage';

export function useImportHistory() {
	const [history, setHistory] = useState<UploadRecord[]>([]);

	useEffect(() => {
		setHistory(getUploadHistory());
	}, []);

	const handleDelete = (id: string) => {
		deleteUploadRecord(id);
		setHistory(getUploadHistory());
	};

	return { history, handleDelete };
}
