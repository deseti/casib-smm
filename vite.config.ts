import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    host: true, // agar bisa diakses dari device lain di jaringan lokal
    port: 5173, // opsional, default 5173
  },
})
