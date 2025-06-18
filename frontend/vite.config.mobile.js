import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3003,
      host: true,
    },
    build: {
      minify: 'esbuild',
      sourcemap: mode === 'development',
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
    define: {
      global: 'globalThis',
    },
    // Mobile app specific configuration
    base: mode === 'production' ? './' : '/',
    // Ensure assets are properly loaded on mobile
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  }
})
