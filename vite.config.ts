import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const ENV = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: ENV.VITE_API_SERVICE_URL,
          changeOrigin: true,
          secure: true,
          rewrite: path => path.replace(/^\/api/, '/')
        },
      },
    },
  }
})
