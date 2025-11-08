// src/components/UploadHistoryTimeline.tsx
import { useNavigate } from 'react-router-dom';
import { useImportHistory } from '../store/useImportHistory';
import { navigateToStage } from '../utils/navigateToStorage';

const translateStage = (stage: string) => {
	const map: Record<string, string> = {
		uploaded: '上传完成',
		cleaning: '清洗中',
		preprocessing: '预处理',
		analyzing: '分析中',
		result: '结果展示',
	};
	return map[stage] || stage;
};

export const UploadHistoryTimeline = () => {
	const navigate = useNavigate();
	const { history, removeHistoryRecord } = useImportHistory();
	console.log('UploadHistoryTimeline 渲染，history:', history); // 调试日志
	if (history.length === 0) return <p className="text-gray-500 text-center">暂无历史记录</p>;

	return (
		<div className="mt-6 space-y-3">
			{history
				.filter((file): file is NonNullable<typeof file> => !!file && !!file.name)
				.map((file) => (
					<div
						key={file.id}
						className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition"
					>
						<div>
							<p className="font-semibold">{file.name}</p>
							<p className="text-xs text-gray-500">
								上传时间：{new Date(file.uploadTime).toLocaleString()}
							</p>
							<p className="text-xs text-blue-600">当前阶段：{translateStage(file.stage)}</p>
						</div>

						<div className="flex gap-2">
							<button
								onClick={() => navigateToStage(navigate, file)}
								className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
							>
								继续任务
							</button>
							<button
								onClick={() => removeHistoryRecord(file.id)}
								className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
							>
								删除
							</button>
						</div>
					</div>
				))}
		</div>
	);
};
