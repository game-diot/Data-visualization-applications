import { useState } from 'react';
import { message } from 'antd';
import { parseFile } from '../utils/parseFile';
import { validateFile } from '../utils/validateFile';
import { type ImportState } from '../types/index';
import { uploadFileToServer } from '../api/uploadFile';
import { type FileUploadResponse } from '../types/index';

import { useUploadHistoryStore } from './useUploadHistoryStore';

export function useFileUpload() {
	const addRecord = useUploadHistoryStore((s) => s.addRecord);
	const [uploadHistoryState, setUploadHistoryState] = useState<ImportState>({
		currentFile: null,
		parsedData: [] as Record<string, unknown>[],
		datasetInfo: null,
		loading: false,
	});

	const handleFileSelect = async (file: File) => {
		const valid = validateFile(file);
		if (!valid.success) {
			message.error(valid.message);
			return;
		}

		setUploadHistoryState((prev) => ({ ...prev, loading: true, currentFile: file }));

		try {
			const { data, info } = await parseFile(file);
			setUploadHistoryState({
				currentFile: file,
				parsedData: data,
				datasetInfo: info,
				loading: false,
			});
			message.success(`文件上传成功：${file.name}`);
		} catch (err) {
			console.error(err);
			message.error('文件解析失败');
			setUploadHistoryState((prev) => ({ ...prev, loading: false, error: '解析错误' }));
		}
	};
	const reset = () => {
		setUploadHistoryState({ currentFile: null, parsedData: [], datasetInfo: null, loading: false });
	};

	const handleUploadToServer = async () => {
		if (!uploadHistoryState.currentFile) {
			message.warning('请先选择文件');
			return;
		}
		setUploadHistoryState((prev) => ({ ...prev, loading: true }));

		try {
			// 发起上传请求
			const response = await uploadFileToServer(uploadHistoryState.currentFile);
			const res: FileUploadResponse = response.data.data;

			message.success(response.data.msg || '文件上传成功');
			addRecord(res); // ← 自动触发所有组件更新
		} catch (error: unknown) {
			// ✅ 区分网络错误与业务错误
			if (error instanceof Error && error.name === 'BusinessError') {
				message.error(error.message); // 后端业务错误
			} else {
				message.error('网络错误，请重试'); // 网络或其他异常
			}
			console.error('[handleUploadToServer]', error);
		} finally {
			setUploadHistoryState((prev) => ({ ...prev, loading: false }));
		}
	};

	return {
		parsedData: uploadHistoryState.parsedData,
		loading: uploadHistoryState.loading,
		currentFile: uploadHistoryState.currentFile,
		datasetInfo: uploadHistoryState.datasetInfo,
		error: uploadHistoryState.error,
		handleFileSelect,
		reset,
		handleUploadToServer,
	};
}
