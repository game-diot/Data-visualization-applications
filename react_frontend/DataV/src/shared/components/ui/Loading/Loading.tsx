import React from 'react';
import { Spin } from 'antd';

export const Loading: React.FC<{ tip?: string }> = ({ tip = '加载中...' }) => (
	<div className="flex items-center justify-center h-full">
		<Spin tip={tip} size="large" />
	</div>
);
