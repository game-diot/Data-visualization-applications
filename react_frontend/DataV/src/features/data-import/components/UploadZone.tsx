// src/components/FileDropzone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useFileUpload } from '../store/useFileUpload';
import { fileService } from '../api/fileService';

export const FileDropzone: React.FC = () => {
	const { setFile, setDatasetInfo, setUploadProgress, setStatus, status } = useFileUpload();
	const [isUploading, setIsUploading] = useState(false);

	/**
	 * 完整上传流程：
	 * 1. 本地解析文件
	 * 2. 上传到后端
	 * 3. 保存后端返回的 _id
	 */
	const handleFileUpload = async (file: File) => {
		try {
			setIsUploading(true);

			// 1. 本地解析文件（Store 负责）
			message.info('正在解析文件...');
			const parsed = await setFile(file);

			if (!parsed) {
				setIsUploading(false);
				return;
			}

			message.success(`文件解析成功: ${file.name}`);

			// 2. 上传到后端（API Service 负责）
			setStatus('uploading');
			message.info('正在上传到服务器...');

			const backendMeta = await fileService.uploadFile(
				file,
				(progress) => setUploadProgress(progress), // 实时更新进度
			);

			// 3. 保存后端返回的完整信息（包含 MongoDB _id）
			setDatasetInfo({
				_id: backendMeta.meta.id, // ✅ 使用后端返回的 MongoDB _id
				name: backendMeta.meta.name,
				size: backendMeta.meta.size,
				type: backendMeta.meta.type,
				uploadTime: backendMeta.meta.uploadTime,
				stage: backendMeta.meta.stage,
				rowCount: parsed.rows.length, // 使用本地解析的行数
			});

			setStatus('uploaded');
			message.success('文件上传成功！后台正在分析质量...');

			// 4. 可选：开始轮询质量检测结果
			// startPollingQuality(backendMeta.meta.id);
		} catch (error) {
			setStatus('error');
			message.error('上传失败：' + (error || '未知错误'));
		} finally {
			setIsUploading(false);
		}
	};

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) {
			message.warning('未选择文件或格式不支持');
			return;
		}

		const file = acceptedFiles[0];
		handleFileUpload(file);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple: false,
		disabled: isUploading || status === 'uploading', // 上传中禁用
		accept: {
			'text/csv': ['.csv'],
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
			'application/vnd.ms-excel': ['.xls'],
		},
	});

	return (
		<div
			{...getRootProps()}
			className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition 
        ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
		>
			<input {...getInputProps()} />
			<UploadOutlined className="text-3xl text-gray-500 mb-3" />
			<p className="text-gray-600">
				{isUploading ? (
					'上传中...'
				) : isDragActive ? (
					'释放文件以上传'
				) : (
					<>
						拖拽文件到此处，或 <span className="text-blue-500">点击上传</span>
					</>
				)}
			</p>
			<p className="text-xs text-gray-400 mt-1">支持 CSV / Excel 文件</p>
		</div>
	);
};
