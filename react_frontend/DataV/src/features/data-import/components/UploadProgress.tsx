// src/components/UploadProgress.tsx
import { useFileUpload } from '../store/useFileUpload';

export const UploadProgress = () => {
	const { status, uploadProgress } = useFileUpload();

	if (status !== 'uploading') return null;

	return (
		<div className="w-full bg-gray-200 rounded mt-3">
			<div
				className="bg-blue-600 text-xs text-white p-1 rounded transition-all duration-200"
				style={{ width: `${uploadProgress}%` }}
			>
				{uploadProgress}%
			</div>
		</div>
	);
};
