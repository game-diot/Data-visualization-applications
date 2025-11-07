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
						status === 'parsed'
							? 'bg-green-100 text-green-600'
							: status === 'confirmed'
								? 'bg-blue-100 text-blue-600'
								: 'bg-gray-100 text-gray-600'
					}`}
				>
					{status}
				</span>
			</div>
			<p>类型：{datasetInfo.type}</p>
			<p>大小：{(datasetInfo.size / 1024 / 1024).toFixed(2)} MB</p>
			<p>行数（预览）：{datasetInfo.rowCount ?? '未知'}</p>
		</div>
	);
};
