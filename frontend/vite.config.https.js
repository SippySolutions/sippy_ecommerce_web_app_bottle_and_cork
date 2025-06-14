import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Check for certificate files
const certPath = path.resolve(__dirname, 'certs')
const certFiles = {
  mkcert: {
    key: path.join(certPath, 'localhost+2-key.pem'),
    cert: path.join(certPath, 'localhost+2.pem')
  },
  openssl: {
    key: path.join(certPath, 'localhost-key.pem'),
    cert: path.join(certPath, 'localhost.pem')
  }
}

// Function to get HTTPS configuration
function getHttpsConfig() {
  // Try mkcert certificates first
  if (fs.existsSync(certFiles.mkcert.key) && fs.existsSync(certFiles.mkcert.cert)) {
    console.log('🔒 Using mkcert certificates for HTTPS')
    return {
      key: fs.readFileSync(certFiles.mkcert.key),
      cert: fs.readFileSync(certFiles.mkcert.cert)
    }
  }
  
  // Try OpenSSL certificates
  if (fs.existsSync(certFiles.openssl.key) && fs.existsSync(certFiles.openssl.cert)) {
    console.log('🔒 Using OpenSSL certificates for HTTPS')
    return {
      key: fs.readFileSync(certFiles.openssl.key),
      cert: fs.readFileSync(certFiles.openssl.cert)
    }
  }
  
  // No certificates found
  console.log('⚠️  No SSL certificates found. Please run certificate setup.')
  console.log('   See HTTPS_SETUP.md for instructions.')
  return false
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3003,
    host: true, // Allow external connections
    https: getHttpsConfig(),
    // Open browser automatically when certificates are available
    open: getHttpsConfig() !== false
  },
  // Resolve any potential SSL issues
  define: {
    global: 'globalThis',
  },
})
