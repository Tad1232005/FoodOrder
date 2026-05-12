import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Ép Admin chạy ở port 5174
    strictPort: true, // Nếu 5174 bị chiếm, báo lỗi luôn chứ không nhảy port bậy bạ
  }
})
