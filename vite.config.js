import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { exec } from 'child_process';
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs';

function generateWasmAliases() {
	const modulesPath = path.resolve(__dirname, 'src/wasm/modules');
	const moduleNames = fs.readdirSync(modulesPath).filter((name) =>
		fs.statSync(path.join(modulesPath, name)).isDirectory()
	);

	const aliases = {};
	moduleNames.forEach((name) => {
		aliases[`@wasm-${name}`] = path.join(modulesPath, name, 'build');
	});

	return aliases;
}

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
			...generateWasmAliases(), // in the form of '@wasm-{module}
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
