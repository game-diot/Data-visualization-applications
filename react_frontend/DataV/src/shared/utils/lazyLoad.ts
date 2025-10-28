import { lazy, type ComponentType } from 'react';

// T 是你的组件类型，K 是你的具名导出组件的名称
// export const MyComponent = ...
export function lazyLoad<T extends ComponentType<unknown>, K extends string>(
	// 传入动态导入函数，例如 () => import('./path/to/component')
	factory: () => Promise<{ [key in K]: T }>,
	// 传入具名导出的组件名称，例如 'HomePage'
	name: K,
) {
	// 返回 React.lazy 所需的 Promise
	return lazy(() =>
		factory().then((module) => ({
			// 将具名导出的组件赋值给 default 属性
			default: module[name],
		})),
	);
}

// 示例用法（可选）：
// const HomePage = lazyLoad(() => import('./pages/home/HomePage'), 'HomePage');
