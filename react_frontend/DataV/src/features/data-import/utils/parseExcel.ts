import * as XLSX from 'xlsx';
import { type PreviewData, type PreviewRow } from '../types/dataImportTypes';

export const parseExcel = async (file: File): Promise<PreviewData> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: 'array' });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const rows = XLSX.utils.sheet_to_json<PreviewRow>(sheet, { defval: null });
			const headers = Object.keys(rows[0] || {});
			resolve({
				headers,
				rows: rows.slice(0, 10),
			});
		};
		reader.onerror = (err) => reject(err);
		reader.readAsArrayBuffer(file);
	});
};
