import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/features': path.resolve(__dirname, './src/features'),
    },
  },
  server: {
    allowedHosts: [
      'xplaino.com',
      'www.xplaino.com',
      '4412-2401-4900-8fd2-af0f-14b9-3ca8-7c53-bb99.ngrok-free.app',
    ],
  },
  preview: {
    allowedHosts: [
      'xplaino.com',
      'www.xplaino.com',
      '4412-2401-4900-8fd2-af0f-14b9-3ca8-7c53-bb99.ngrok-free.app',
    ],
  },
})



