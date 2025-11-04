import React, { useMemo } from 'react';
import { Table, Button, Empty } from 'antd';
import { type ColumnsType } from 'antd/es/table';

//数据预览组件props
interface DataPreviewProps {
	parseData: Record<string, unknown>[];
	onClear: () => void;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ parseData, onClear }) => {
	const columns = useMemo<ColumnsType<Record<string, unknown>>>(() => {
		if (!parseData.length) return [];
		return Object.keys(parseData[0]).map((key) => ({
			title: key,
			dataIndex: key,
			key,
		}));
	}, [parseData]);

	return (
		<div className="p-4 bg-white rounded-2xl shadow-sm">
			{parseData.length ? (
				<>
					<div className="flex justify-between mb-2">
						<h3 className="text-lg font-semibold">数据预览</h3>

						<Button onClick={onClear}>取消上传</Button>
					</div>
					<p className="text-gray-500 mb-2">
						仅展示文件前 10 行数据用于预览，完整内容将在后续处理阶段加载。
					</p>

					<Table
						dataSource={parseData.slice(0, 10)}
						columns={columns}
						rowKey={(_, index) => String(index)}
						pagination={false}
						scroll={{ x: 'max-content' }}
					/>
				</>
			) : (
				<Empty description="暂无数据，请先上传文件" />
			)}
		</div>
	);
};
