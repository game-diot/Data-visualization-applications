import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { type DatasetInfo } from '../types/index';

export async function parseFile(file: File): Promise<{
	data: Record<string, unknown>[];
	info: DatasetInfo;
}> {
	const ext = file.name.split('.').pop()?.toLowerCase();

	let data: Record<string, unknown>[] = [];

	if (ext === 'csv') {
		const text = await file.text();
		const result = Papa.parse<Record<string, unknown>>(text, { header: true });
		data = result.data;
	} else if (ext === 'xlsx' || ext === 'xls') {
		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'array' });
		const sheetName = workbook.SheetNames[0];
		data = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName]);
	} else {
		throw new Error('不支持的文件类型');
	}

	const info: DatasetInfo = {
		id: crypto.randomUUID(),
		name: file.name,
		rowCount: data.length,
		columnCount: Object.keys(data[0] || {}).length,
		uploadTime: new Date().toISOString(),
	};

	return { data, info };
}
