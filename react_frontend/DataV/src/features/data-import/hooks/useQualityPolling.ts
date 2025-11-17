// src/hooks/useQualityPolling.ts
import { useState, useEffect } from 'react';
import { fileService } from '../api/fileService';
import { message } from 'antd';

export const useQualityPolling = (fileId: string | null) => {
	const [qualityResult, setQualityResult] = useState<unknown>(null);
	const [isPolling, setIsPolling] = useState(false);

	useEffect(() => {
		if (!fileId) return;

		setIsPolling(true);
		const interval = setInterval(async () => {
			try {
				const result = await fileService.getQualityResult(fileId);

				if (result.status === 'completed') {
					clearInterval(interval);
					setQualityResult(result.data);
					setIsPolling(false);
					message.success('质量检测完成！');
				} else if (result.status === 'failed') {
					clearInterval(interval);
					setIsPolling(false);
					message.error('质量检测失败');
				}
			} catch (error) {
				console.error('轮询失败', error);
			}
		}, 3000); // 每 3 秒轮询一次

		return () => clearInterval(interval);
	}, [fileId]);

	return { qualityResult, isPolling };
};
