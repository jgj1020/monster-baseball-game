import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 깃허브 페이지에 배포할 때 절대 경로 오류(404)를 막아주는 필수 설정입니다!
  base: '/monster-baseball-game/', 
})