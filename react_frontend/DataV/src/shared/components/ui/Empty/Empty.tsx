import React from 'react';
import { Empty as AntdEmpty } from 'antd';

export const Empty: React.FC<{ description?: string }> = ({ description }) => (
	<AntdEmpty description={description || '暂无数据'} />
);
