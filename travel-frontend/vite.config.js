import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Travel-WanderTribe-/',
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
  server: {
    allowedHosts: 'all',
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
