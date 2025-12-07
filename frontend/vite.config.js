import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // IMPORTANT: Allow network access from other devices!
    port: 5173,            // Frontend runs on 5173
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // FastAPI backend server
        changeOrigin: true,
        secure: false,
      },
      '/incidents': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
