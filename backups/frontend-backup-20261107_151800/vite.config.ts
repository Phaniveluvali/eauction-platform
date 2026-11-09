import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/seller-buyer/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/v1/catalog': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/v1/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/v1/auctions': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/v1/payments': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
});
