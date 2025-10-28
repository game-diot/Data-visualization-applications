import React from 'react';
import { Button as AntdButton, type ButtonProps as AntdButtonProps } from 'antd';
import styles from './Button.module.css';

export interface ButtonProps extends AntdButtonProps {
	label?: string;
}

export const Button: React.FC<ButtonProps> = ({ label, ...props }) => {
	return (
		<AntdButton className={styles.button} {...props}>
			{label}
		</AntdButton>
	);
};
