import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Replace __BUILD_TIMESTAMP__ at compile time - FORCE RELOAD v1.0.21
    '__BUILD_TIMESTAMP__': JSON.stringify(Date.now()),
  },
  plugins: [
    react(),
    VitePWA({
      // 🔥 SERVICE WORKER DISABLED: Prevents cache blocking updates
      disable: true,
      injectRegister: null,
      manifest: {
        name: 'Helio - Your AI Wellness Companion',
        short_name: 'Helio',
        description: 'Rise to your best self with AI-powered wellness coaching, smart habit tracking, and personalized health insights',
        theme_color: '#f59e0b',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    // 🔥 AGGRESSIVE CACHE BUSTING: Remove hashes entirely, use timestamp-only naming
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['@tensorflow/tfjs-backend-wasm'],
      output: {
        // Generate unique filename using timestamp + counter
        entryFileNames: () => `assets/entry-${Date.now()}-[name].js`,
        chunkFileNames: () => `assets/chunk-${Date.now()}-[name].js`,
        assetFileNames: () => `assets/asset-${Date.now()}-[name].[ext]`
      }
    },
    // Clear output directory before build
    emptyOutDir: true
  }
})
