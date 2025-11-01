import { useState } from 'react';
import { message } from 'antd';
import { parseFile } from '../utils/parseFile';
import { validateFile } from '../utils/validateFile';
import type { ImportState } from '../types/index';
import { uploadFileToServer } from '../api/uploadFile';
import { saveUploadRecord } from '../utils/storage';

export function useFileUpload() {
	const [state, setState] = useState<ImportState>({
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

		setState((prev) => ({ ...prev, loading: true, currentFile: file }));

		try {
			const { data, info } = await parseFile(file);
			setState({
				currentFile: file,
				parsedData: data,
				datasetInfo: info,
				loading: false,
			});
			message.success(`文件上传成功：${file.name}`);
		} catch (err) {
			console.error(err);
			message.error('文件解析失败');
			setState((prev) => ({ ...prev, loading: false, error: '解析错误' }));
		}
	};
	const reset = () => {
		setState({ currentFile: null, parsedData: [], datasetInfo: null, loading: false });
	};

	const handleUploadToServer = async () => {
		if (!state.currentFile) {
			message.warning('请先选择文件');
			return;
		}
		setState((prev) => ({ ...prev, loading: true }));

		try {
			const res = await uploadFileToServer(state.currentFile);
			message.success(res?.msg || '文件上传成功');

			saveUploadRecord({
				id: Date.now().toString(),
				filename: state.currentFile!.name,
				size: state.currentFile!.size,
				type: state.currentFile!.type,
				date: new Date().toLocaleString(),
			});
		} catch (error) {
			message.error(`文件上传失败，${error}`);
		} finally {
			setState((prev) => ({ ...prev, loading: false }));
		}
	};
	return {
		parsedData: state.parsedData,
		loading: state.loading,
		currentFile: state.currentFile,
		datasetInfo: state.datasetInfo,
		error: state.error,
		handleFileSelect,
		reset,
		handleUploadToServer,
	};
}
