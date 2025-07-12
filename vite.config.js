import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { exec } from 'child_process';
import path from 'path';
import fg from 'fast-glob';

// https://vite.dev/config/
export default defineConfig({
	// Ensure Vite copies .wasm files
	assetsInclude: ['**/*.wasm'],
	resolve: {
		alias: {
			'@pages': path.resolve(__dirname, 'src/pages'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@utils': path.resolve(__dirname, 'src/utils'),
			'@wasm': path.resolve(__dirname, 'src/wasm/build'),
		}
	},
	plugins: [
		react(),
		// Custom build processes
		{
			name: 'watch-cpp-and-build-wasm',
			__isBuilding: false,

			handleHotUpdate({ file, server }) {
				if ((file.endsWith('.cpp') || file.endsWith('.h')) && !this.__isBuilding) {
					this.__isBuilding = true;
					console.log(`Detected change in ${file}, running make...`);
					exec('npm run build-wasm', (err, stdout, stderr) => {
						this.__isBuilding = false;
						if (err) {
							console.error('Make error:', stderr);
						} else {
							console.log('Make output:', stdout);
							server.ws.send({ type: 'full-reload' });
						}
					});
				}
			},

			configureServer(server) {
				const files = fg.sync('src/wasm/**/*.{cpp,h}').map((f) => path.resolve(f));
				files.forEach((file) => server.watcher.add(file));
			}
		}
	],
})
