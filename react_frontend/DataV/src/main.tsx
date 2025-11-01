import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './app/components/ErrorBoundary';
import { App } from './app/App';
import './shared/i18n';
import './styles/reset.css';
import './styles/variables.css';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</StrictMode>,
);
