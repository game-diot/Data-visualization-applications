import React from 'react';
import { Button } from 'antd';

interface ErrorFallbackProps {
	message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ message }) => {
	return (
		<div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
			<h1 className="text-2xl font-bold text-red-500">页面出错了 😢</h1>
			<p className="text-gray-600">{message || '请刷新页面或稍后重试。'}</p>
			<Button type="primary" onClick={() => window.location.reload()}>
				刷新页面
			</Button>
		</div>
	);
};
