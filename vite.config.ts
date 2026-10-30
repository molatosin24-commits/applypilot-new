import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'offline.html', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'ApplyPilot',
        short_name: 'ApplyPilot',
        description: 'Find Jobs. Apply Smarter. Get Hired.',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        // Do not cache API job responses as "fresh"
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(jobicy\.com|remotive\.com|remoteok\.com)\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'job-apis-network-only'
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})
