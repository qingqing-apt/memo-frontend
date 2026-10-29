import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // CopilotKit Runtime（Node Express，端口 3000），需放在 /api 之前
      '/api/copilotkit': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // 前端请求 /api/xxx 会被代理到后端 http://127.0.0.1:8000/xxx
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
