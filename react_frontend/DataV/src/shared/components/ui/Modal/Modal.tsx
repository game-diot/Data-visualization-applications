import React from 'react';
import { Modal as AntdModal, type ModalProps } from 'antd';

export const Modal: React.FC<ModalProps> = (props) => {
	return <AntdModal {...props} />;
};
