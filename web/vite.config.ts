import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Use MSGCORE_ prefix for environment variables instead of VITE_
  envPrefix: 'MSGCORE_',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.MSGCORE_PORT || '5173'),
    host: '0.0.0.0', // Listen on all interfaces
    allowedHosts: ['dev.msgcore.dev', 'localhost', '127.0.0.1'],
    fs: {
      // Restrict file serving to only the project directory
      strict: true,
      // Only allow serving files from these directories
      allow: [
        __dirname, // Allow project root for index.html
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'public'),
        path.resolve(__dirname, 'node_modules'),
      ],
    },
  },
})
