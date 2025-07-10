import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import { dirname } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }: { mode: string }) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '0.0.0'),
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV || mode),
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
    },

    resolve: {
      alias: {
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@auth': fileURLToPath(new URL('./src/auth', import.meta.url)),
        '@components': fileURLToPath(
          new URL('./src/components', import.meta.url)
        ),
        '@configs': fileURLToPath(new URL('./src/configs', import.meta.url)),
        '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@routing': fileURLToPath(new URL('./src/routing', import.meta.url)),
        '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
        '@theme': fileURLToPath(new URL('./src/theme', import.meta.url)),
        '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      },
    },

    // Optimization for dependency pre-bundling
    optimizeDeps: {
      include: ['@tabler/icons-react'],
      exclude: [],
    },

    // Server configuration
    server: {
      open: true,
      host: true,
      port: parseInt(env.VITE_PORT || '3000', 10),
    },

    // Preview configuration
    preview: {
      open: true,
      host: true,
      port: parseInt(env.VITE_PORT || '3000', 10),
    }, // Build options
    build: {
      outDir: 'build',
      sourcemap: mode !== 'production',
      ...(mode === 'production'
        ? {
            minify: true,
            rollupOptions: {
              output: {
                manualChunks: undefined,
              },
            },
          }
        : {}),
    },
  };
});
