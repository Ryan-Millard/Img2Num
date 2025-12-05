import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { exec } from 'child_process';
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs';
import { promisify } from 'util';
import { imagetools } from 'vite-imagetools';
import generateContributorCreditsPlugin from './scripts/generate-contributor-credits-json.js';
import VitePluginSitemap from 'vite-plugin-sitemap';

const execAsync = promisify(exec);

function generateWasmAliases() {
  const modulesPath = path.resolve(__dirname, 'src/wasm/modules');
  const moduleNames = fs
    .readdirSync(modulesPath)
    .filter((name) => fs.statSync(path.join(modulesPath, name)).isDirectory());
  const aliases = {};
  moduleNames.forEach((name) => {
    aliases[`@wasm-${name}`] = path.join(modulesPath, name, 'build');
    console.log(`Found wasm module: ${name}`);
  });
  return aliases;
}

// Build WASM modules on startup
async function buildWasmModules() {
  console.log('🔨 Building WASM modules on startup...');
  try {
    const { stdout, stderr } = await execAsync('npm run build-wasm');
    console.log('✅ WASM modules built successfully');
    if (stdout) console.log('Build output:', stdout);
    if (stderr) console.log('Build warnings:', stderr);
  } catch (error) {
    console.error('❌ Failed to build WASM modules:', error.message);
    console.error('Make sure you have emscripten installed and npm run build-wasm is configured');
  }
}

export default defineConfig({
  base: '/Img2Num/', // important for GitHub Pages
  server: {
    watch: {
      ignored: ['src/wasm/**/*.js', 'src/wasm/**/*.wasm'],
    },
  },
  // Ensure Vite copies .wasm files
  assetsInclude: ['**/*.wasm'],
  resolve: {
    alias: {
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@workers': path.resolve(__dirname, 'src/workers'),
      '@global-styles': path.resolve(__dirname, 'src/global-styles'),
      '@data': path.resolve(__dirname, 'src/data'),
      ...generateWasmAliases(), // in the form of '@wasm-{module}
    },
  },
  plugins: [
    react(),
    imagetools(),
    VitePluginSitemap({
      hostname: 'https://ryan-millard.github.io/Img2Num',
      dynamicRoutes: ['/', '/credits'],
    }),
    generateContributorCreditsPlugin(),
    // Build WASM modules on startup
    {
      name: 'build-wasm-on-startup',
      async buildStart() {
        // Only build on production builds
        if (process.env.NODE_ENV === 'production') {
          await buildWasmModules();
        }
      },
      async configureServer() {
        // Only build on dev server start
        await buildWasmModules();
      },
    },
    // Custom build processes for file watching
    {
      name: 'watch-cpp-and-build-wasm',
      __isBuilding: false,
      handleHotUpdate({ file }) {
        if ((file.endsWith('.cpp') || file.endsWith('.h')) && !this.__isBuilding) {
          this.__isBuilding = true;
          console.log(`🔄 Detected change in ${file}, rebuilding WASM...`);
          exec('npm run build-wasm', (err, stdout, stderr) => {
            this.__isBuilding = false;
            if (err) {
              console.error('❌ WASM build error:', stderr);
            } else {
              console.log('✅ WASM rebuilt successfully');
              if (stdout) console.log('Build output:', stdout);
            }
          });
        }
      },
      configureServer(server) {
        const files = fg.sync('src/wasm/**/*.{cpp,h}').map((f) => path.resolve(f));
        files.forEach((file) => server.watcher.add(file));
      },
    },
  ],
});
