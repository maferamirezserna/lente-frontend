import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, /api se reenvía al backend (VM-APP por VPN). Así no hay problemas de CORS.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.LENTE_BACKEND || 'http://10.60.14.182:8000'
  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': { target: backend, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
      },
    },
  }
})
