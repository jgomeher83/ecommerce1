import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
      // Only add proxy in development
      proxy: process.env.NODE_ENV === 'development' ? {
        // Handle API routes if you have any
        // '/api': {
        //   target: 'http://your-api-url',
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/api/, '')
        // }
      } : undefined
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
    base: env.VITE_APP_BASE_URL || '/'
  }
})
