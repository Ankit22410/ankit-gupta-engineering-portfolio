import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor':  ['three'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: { include: ['react', 'react-dom', 'three'] },
  server: { port: 3000, open: true, host: true },
})