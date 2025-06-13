import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// HTTP-only configuration for development when HTTPS fails
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3003,
    host: true,
    https: false, // Disable HTTPS for this config
  },
})
