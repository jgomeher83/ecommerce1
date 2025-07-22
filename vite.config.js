import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 1037,
    open: true,
    strictPort: true,
    // This handles the fallback for client-side routing
    proxy: {
      // Handle API routes if you have any
      // '/api': {
      //   target: 'http://your-api-url',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // },
      // This is the important part for SPA routing
      '^/.*': {
        target: 'http://localhost:1037',
        changeOrigin: true,
        rewrite: (path) => '/index.html'
      }
    }
  },
  // This is important for client-side routing in production
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  // This helps with base URL in development and production
  base: process.env.NODE_ENV === 'production' ? '/' : '/'
})
