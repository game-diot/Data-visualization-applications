import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProviderProps {
	children: React.ReactNode;
}
export const Providers: React.FC<ProviderProps> = ({ children }) => {
	return (
		<ErrorBoundary>
			<ConfigProvider
				theme={{
					algorithm: theme.defaultAlgorithm,
					token: { colorPrimary: '#1677ff', borderRadius: 8 },
				}}
			>
				{children}
				<ToastContainer position="top-right" autoClose={3000} />
			</ConfigProvider>
		</ErrorBoundary>
	);
};
