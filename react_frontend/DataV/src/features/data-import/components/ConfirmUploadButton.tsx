// src/components/ConfirmUploadButton.tsx
import { useSaveDataset } from '../hooks/useSaveDataset';
import { useFileUpload } from '../store/useFileUpload';

// src/components/ConfirmUploadButton.tsx
export const ConfirmUploadButton = () => {
	const { status } = useFileUpload();
	const { saveDataset } = useSaveDataset();

	return (
		<button
			onClick={saveDataset}
			disabled={status === 'uploading'}
			className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
		>
			{status === 'uploading' ? '正在上传...' : '确认上传'}
		</button>
	);
};
