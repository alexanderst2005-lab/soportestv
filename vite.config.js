import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Genera archivos .br y .gz para assets JS/CSS (reduce peso ~70-80% sobre la red)
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown): manualChunks debe ser una función
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
        },
      },
    },
  },
});
