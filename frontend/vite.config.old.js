
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Check if certificates exist
const certPath = path.resolve(__dirname, 'certs/localhost.pem')
const keyPath = path.resolve(__dirname, 'certs/localhost-key.pem')
const certsExist = fs.existsSync(certPath) && fs.existsSync(keyPath)

// HTTPS configuration
const httpsConfig = certsExist ? {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
} : false

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3003,
    host: true,
    // Use HTTPS if certificates are available
    https: httpsConfig,
  },  build: {
    // Optimize for production - using esbuild for better compatibility
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', '@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  // Resolve any potential SSL issues
  define: {
    global: 'globalThis',
  },
})
