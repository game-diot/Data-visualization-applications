import Papa from 'papaparse';
import { type PreviewData, type PreviewRow } from '../types/dataImportTypes';

export const parseCSV = async (file: File): Promise<PreviewData> => {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true, // ✅ 自动把每行变成对象
			complete: (result) => {
				const rows = result.data as PreviewRow[];
				const headers = result.meta.fields ?? Object.keys(rows[0] || {});
				resolve({
					headers,
					rows: rows.slice(0, 10),
				});
			},
			error: (err) => reject(err),
		});
	});
};
