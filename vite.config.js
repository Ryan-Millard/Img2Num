import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react()
	],
	// Ensure Vite copies .wasm files
	assetsInclude: ['**/*.wasm'],
	resolve: {
		alias: {
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@hooks': path.resolve(__dirname, 'src/hooks'),
			'@utils': path.resolve(__dirname, 'src/utils'),
			'@wasm': path.resolve(__dirname, 'src/wasm/build'),
		}
	}
})
