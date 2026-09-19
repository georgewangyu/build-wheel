import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: process.env.BUILD_WHEEL_PREVIEW_HOST ? [process.env.BUILD_WHEEL_PREVIEW_HOST] : [],
  },
});
