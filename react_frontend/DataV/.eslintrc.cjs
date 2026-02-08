module.exports = {
	// 设置运行环境
	env: {
		browser: true, // 启用浏览器全局变量
		es2020: true, // 启用 ES2020 语法
		node: true, // 启用 Node.js 全局变量 (用于 vite.config.ts 等)
	},

	// 设置解析器为 @typescript-eslint/parser
	parser: '@typescript-eslint/parser',

	// 指定解析器选项
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},

	// 核心配置：继承和扩展
	extends: [
		'eslint:recommended', // ESLint 推荐的通用规则
		'plugin:react/recommended', // React 推荐规则
		'plugin:react-hooks/recommended', // React Hooks 推荐规则
		'plugin:@typescript-eslint/recommended', // TS 推荐规则
		'plugin:jsx-a11y/recommended', // 辅助功能推荐规则

		// 🔥 必须放在最后：禁用所有与 Prettier 冲突的规则
		'plugin:prettier/recommended',
	],

	// 插件
	plugins: [
		'react',
		'react-hooks',
		'@typescript-eslint',
		'jsx-a11y',
		'prettier', // 使用 Prettier 插件
	],

	// 自定义规则覆盖
	rules: {
		// 示例：可以自定义或覆盖 extends 中的规则
		'react/prop-types': 'off', // 在 TS 项目中关闭 PropTypes 检查
		'@typescript-eslint/no-explicit-any': 'off', // 允许使用 any

		// 让 Prettier 格式化失败时报告错误
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto', // 示例：兼容不同操作系统的换行符
			},
		],
	},

	// 针对特定文件类型的设置
	settings: {
		react: {
			version: 'detect', // 自动检测项目中安装的 React 版本
		},
	},
};
