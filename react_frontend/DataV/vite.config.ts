import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import compression from 'vite-plugin-compression';
// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		compression({
			algorithm: 'gzip',
			ext: '.gz',
			threshold: 10240,
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	server: {
		port: 5173,
		open: true,
	},
});
