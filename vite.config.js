import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🎯 새 레포지토리 이름인 /monster-baseball-game/ 으로 변경합니다! (앞뒤 슬래시 필수)
  base: '/monster-baseball-game/',
})