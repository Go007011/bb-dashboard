import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.NEXT_PUBLIC_API_URL || 'http://localhost:7071';

  return {
    base: './',
    plugins: [react()],
    define: {
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(mode === 'development' ? '' : env.NEXT_PUBLIC_API_URL || ''),
    },
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
