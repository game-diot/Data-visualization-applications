// src/features/data-import/components/ImportRecordCard.tsx
import { Card, Button } from 'antd';
import type { UploadRecord } from '../utils/storage';

interface Props {
	record: UploadRecord;
	onDelete: (id: string) => void;
}

export const ImportRecordCard: React.FC<Props> = ({ record, onDelete }) => (
	<Card
		size="small"
		style={{ marginBottom: 8 }}
		title={record.filename}
		extra={
			<Button danger size="small" onClick={() => onDelete(record.id)}>
				删除
			</Button>
		}
	>
		<p>文件类型：{record.type}</p>
		<p>大小：{(record.size / 1024).toFixed(2)} KB</p>
		<p>上传时间：{record.date}</p>
	</Card>
);
