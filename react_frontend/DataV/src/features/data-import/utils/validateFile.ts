const ALLOWED_TYPES = [
	'text/csv',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_SIZE_MB = 10;

export function validateFile(file: File): { success: boolean; message?: string } {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return { success: false, message: '文件类型不支持，仅支持 CSV / Excel' };
	}
	if (file.size > MAX_SIZE_MB * 1024 * 1024) {
		return { success: false, message: `文件不能超过 ${MAX_SIZE_MB}MB` };
	}
	return { success: true };
}
