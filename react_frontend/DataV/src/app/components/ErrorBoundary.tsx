import React, { Component, type ReactNode } from 'react';
import { Logger } from '../../shared/utils/logger';
import { toast } from 'react-toastify';
interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, info);
		Logger.error('React Rendering Error', { error, info });
		toast.error('组件渲染出现问题，请刷新页面');
	}

	render() {
		if (this.state.hasError) {
			return (
				<div>
					<h2 className="fles fles-col items-cneter justify-center h-screen text-center">
						😥 应用出现错误
					</h2>
					<p className="text-xl font-semibold text-red-500">{this.state.error?.message}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
					>
						刷新页面
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
