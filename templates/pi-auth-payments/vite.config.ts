import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Required for Pi Sandbox iframe embedding
    headers: {
      'Content-Security-Policy': "frame-ancestors 'self' https://*.pinet.com https://*.minepi.com; connect-src 'self' https://socialchain.app https://sdk.minepi.com https://api.minepi.com"
    }
  }
})
