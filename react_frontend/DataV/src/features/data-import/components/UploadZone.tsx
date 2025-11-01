import { useDropzone } from 'react-dropzone';
import { UploadOutlined } from '@ant-design/icons';
import { message } from 'antd';

interface UploadZoneProps {
	onFileSelect: (file: File) => void;
	loading?: boolean;
}

export function UploadZone({ onFileSelect, loading = false }: UploadZoneProps) {
	const onDrop = (acceptedFiles: File[]) => {
		if (acceptedFiles.length === 0) {
			message.warning('未选择文件或格式不支持');
			return;
		}
		onFileSelect(acceptedFiles[0]);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		multiple: false,
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
      `}
			aria-busy={loading}
		>
			<input {...getInputProps()} />
			<UploadOutlined className="text-3xl text-gray-500 mb-3" />
			<p className="text-gray-600">
				拖拽文件到此处，或 <span className="text-blue-500">点击上传</span>
			</p>
			<p className="text-xs text-gray-400 mt-1">支持 CSV / Excel 文件</p>
		</div>
	);
}
