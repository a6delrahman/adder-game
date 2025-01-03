import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://adder-game-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
build: {  outDir: 'dist',  assetsDir: 'assets',}
})
