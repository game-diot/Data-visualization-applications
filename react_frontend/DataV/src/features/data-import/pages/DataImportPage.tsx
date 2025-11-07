import { Tabs } from 'antd';
import { useState } from 'react';
import { useFileUpload } from '../store/useFileUpload';
import { FileDropzone } from '../components/UploadZone';
//DataImportPage页面所用到组件
import { DataPreviewTable } from '../components/DataPreviewTable';
import { ConfirmUploadButton } from '../components/ConfirmUploadButton';
import { UploadHistoryTimeline } from '../components/UploadHistoryTimeline';
import { StepProgress } from '../components/SetpProgress';
export function DataImportPage() {
	const [activeKey, setActiveKey] = useState('file');
	const { previewData } = useFileUpload();

	const steps = [
		'选择文件上传',
		'预览文件',
		'解析文件',
		'预处理数据',
		'导入数据库',
		'分析数据',
		'分析结果',
	];
	let currentStep = 0; // 例如当前正在“解析文件”阶段

	if (previewData) currentStep = 1;
	return (
		<div>
			<header className="mb-6">
				<h1 className="text-2xl font-semibold">数据上传模块</h1>
				<p className="text-gray-500 text-sm">支持格式文件导入、解析、预览</p>
				<div className="p-6">
					<StepProgress steps={steps} currentStep={currentStep} />
					{/* 其余内容 */}
				</div>
			</header>

			<Tabs
				activeKey={activeKey}
				onChange={setActiveKey}
				items={[
					{
						key: 'file',
						label: <>上传文件</>,
					},
					{
						key: 'handle',
						label: <>手动导入</>,
					},
				]}
			/>
			<section>
				{activeKey === 'file' && <FileDropzone />}
				{/* {activeKey === 'handle' && <HandleDataImport />} */}
			</section>
			<section>
				<ConfirmUploadButton />
				<DataPreviewTable data={previewData} />
			</section>

			<section>
				<UploadHistoryTimeline />
			</section>
		</div>
	);
}
