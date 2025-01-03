import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://adder-backend.azurewebsites.net/api',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'wss://adder-backend.azurewebsites.net',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist'
  }
})