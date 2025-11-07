export const validateFile = (file: File): { valid: boolean; message?: string } => {
	const allowedTypes = [
		'text/csv',
		'application/vnd.ms-excel',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	];
	const maxSize = 10 * 1024 * 1024; // 10MB

	if (!allowedTypes.includes(file.type)) {
		return { valid: false, message: '仅支持 CSV 或 Excel 文件格式' };
	}

	if (file.size > maxSize) {
		return { valid: false, message: '文件过大（超过10MB），请重新选择' };
	}

	return { valid: true };
};
