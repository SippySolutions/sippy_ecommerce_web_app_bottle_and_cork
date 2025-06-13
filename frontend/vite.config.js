
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3003,
    host: true, // Allow external connections
    // For Accept.js to work, we need HTTPS
    // Using basic HTTPS setup - browser will show security warning that you can bypass
    https: true,
  },
  // Resolve any potential SSL issues
  define: {
    global: 'globalThis',
  },
})
