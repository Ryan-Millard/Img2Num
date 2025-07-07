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
			// map "@wasm" -> "<project-root>/wasm/build"
			'@wasm': path.resolve(__dirname, 'src/wasm/build')
		}
	}
})
