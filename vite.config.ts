import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Map process.env to window.process.env for runtime injection in Docker
    'process.env': 'window.process.env'
  }
});