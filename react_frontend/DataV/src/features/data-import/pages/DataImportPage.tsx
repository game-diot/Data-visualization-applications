import { Tabs, Button } from 'antd';
import { useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { useFileUpload } from '../hooks/useFileUpload';
import { DataPreview } from '../components/DataPreview';
import { useUploadHistoryStore } from '../hooks/useUploadHistoryStore';
import { ImportRecordCard } from '../components/ImportRecordCard';

export function DataImportPage() {
	const [activeKey, setActiveKey] = useState('upload');
	const { parsedData, reset, loading, handleFileSelect, handleUploadToServer } = useFileUpload();

	const history = useUploadHistoryStore((s) => s.history);
	const deleteRecord = useUploadHistoryStore((s) => s.deleteRecord);

	return (
		<div>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold">数据上传模块</h1>
				<p className="text-gray-500 text-sm">支持格式文件导入、解析、预览</p>
			</header>

			<Tabs
				activeKey={activeKey}
				onChange={setActiveKey}
				items={[
					{
						key: 'upload',
						label: <>上传数据</>,
					},
					{
						key: 'history',
						label: <>导入记录</>,
					},
				]}
			/>

			<main className="mt-4 bg-white p-4 rounded-2xl shadow-sm">
				{activeKey === 'upload' && (
					<>
						<UploadZone onFileSelect={handleFileSelect} loading={loading} />
						<Button
							type="primary"
							onClick={handleUploadToServer}
							loading={loading}
							style={{ marginTop: 16 }}
						>
							上传至后端
						</Button>
						<DataPreview parseData={parsedData} onClear={reset} />
					</>
				)}
				{activeKey === 'history' && <DataPreview parseData={parsedData} onClear={reset} />}

				<div style={{ marginTop: 24 }}>
					<h3>上传历史</h3>
					{history.length === 0 ? (
						<p>暂无上传记录</p>
					) : (
						history.map((record) => (
							<ImportRecordCard
								key={record._id}
								record={record}
								onDelete={() => {
									deleteRecord(record._id);
								}}
							/>
						))
					)}
				</div>
			</main>
		</div>
	);
}
