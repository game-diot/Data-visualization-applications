// src/components/FilePreviewCard.tsx
import { useFileUpload } from '../store/useFileUpload';

export const FilePreviewCard = () => {
	const { datasetInfo, status } = useFileUpload();

	if (!datasetInfo) return null;

	return (
		<div className="p-4 rounded-2xl shadow-sm border bg-white">
			<div className="flex justify-between items-center mb-2">
				<h3 className="font-semibold">{datasetInfo.name}</h3>
				<span
					className={`text-sm px-2 py-1 rounded ${
						status === 'uploaded'
							? 'bg-green-100 text-green-600'
							: status === 'uploading'
								? 'bg-blue-100 text-blue-600'
								: status === 'parsed'
									? 'bg-yellow-100 text-yellow-600'
									: 'bg-gray-100 text-gray-600'
					}`}
				>
					{status === 'uploaded'
						? '已上传'
						: status === 'uploading'
							? '上传中'
							: status === 'parsed'
								? '已解析'
								: status}
				</span>
			</div>

			{/* ✅ 显示后端返回的 MongoDB _id */}
			{datasetInfo._id && <p className="text-xs text-gray-500 mb-2">文件 ID: {datasetInfo._id}</p>}

			<p className="text-sm text-gray-700">类型: {datasetInfo.type}</p>
			<p className="text-sm text-gray-700">
				大小: {(datasetInfo.size / 1024 / 1024).toFixed(2)} MB
			</p>
			<p className="text-sm text-gray-700">行数(预览): {datasetInfo.rowCount ?? '未知'}</p>
			<p className="text-xs text-gray-400 mt-1">
				上传时间: {new Date(datasetInfo.uploadTime).toLocaleString()}
			</p>
		</div>
	);
};
