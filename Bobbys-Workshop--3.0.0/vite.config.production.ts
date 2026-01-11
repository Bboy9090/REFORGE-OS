/**
 * Production Vite Configuration
 * Optimized build settings for production deployment
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import { createIconImportProxy } from './build/icon-import-proxy';
import { sparkPlugin } from './build/spark-plugin';

const projectRoot = resolve(__dirname);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createIconImportProxy() as any,
    sparkPlugin() as any,
  ],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
          'state-vendor': ['zustand'],
          'utils-vendor': ['sonner', 'date-fns'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000, // Warn if chunk exceeds 1MB
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  server: {
    port: 5000,
    strictPort: false,
  },
});
