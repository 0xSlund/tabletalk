import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Optimize development server to reduce excessive requests
    hmr: {
      overlay: false, // Disable HMR overlay to reduce requests
    },
    // Reduce polling frequency
    watch: {
      usePolling: false,
    },
  },
});
