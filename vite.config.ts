import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/data': API_URL,
      '/tasks': API_URL,
      '/links': API_URL,
    },
  },
});
