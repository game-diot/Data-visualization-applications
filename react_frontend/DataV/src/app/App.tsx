import { Providers } from './providers/providers';
import { AppRouter } from './router';
import { setupGlobalErrorHandler } from '../shared/utils/setupGlobalErrorHandler';
export function App() {
	setupGlobalErrorHandler();
	return (
		<Providers>
			<AppRouter />
		</Providers>
	);
}
