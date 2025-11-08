// utils/navigateToStage.ts
import { type HistoryRecord } from '../store/useImportHistory';

export const navigateToStage = (navigate: (path: string) => void, file: HistoryRecord) => {
	switch (file.stage) {
		case 'uploaded':
			navigate(`/files/${file.id}/cleaning`);
			break;
		// case 'cleaning':
		// 	navigate(`/files/${file.id}/preprocessing`);
		// 	break;
		// case 'preprocessing':
		// 	navigate(`/files/${file.id}/analyzing`);
		// 	break;
		// case 'analyzing':
		case 'result':
			navigate(`/files/${file.id}/result`);
			break;
	}
};
