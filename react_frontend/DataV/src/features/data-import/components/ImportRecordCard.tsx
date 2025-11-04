import { Card, Button } from 'antd';
import { type FileUploadResponse } from '../types/index';

//上传历史记录组件props
interface UploadRecordCardProps {
	record: FileUploadResponse;
	onDelete: (storedName: string) => void;
}

export const ImportRecordCard: React.FC<UploadRecordCardProps> = ({ record, onDelete }) => (
	<Card
		size="small"
		style={{ marginBottom: 8 }}
		title={record.originName}
		extra={
			<Button danger size="small" onClick={() => onDelete(record.storedName)}>
				删除
			</Button>
		}
	>
		<p>文件类型：{record.format}</p>
		<p>大小：{(record.size / 1024).toFixed(2)} KB</p>
		<p>上传时间：{record.updatedAt}</p>
	</Card>
);
