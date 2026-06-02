import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo-192.jpg', 'logo-512.png', 'logo-maskable.png'],
      manifest: {
        id: '/',
        name: 'FoodOrder',
        short_name: 'FoodOrder',
        description: 'Order delicious food online',
        theme_color: '#ff6347',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logo-192.jpg',
            sizes: '192x192',
            type: 'image/jpg'
          },
          {
            src: '/logo-512.jpg',
            sizes: '512x512',
            type: 'image/jpg'
          },
          {
            src: '/logo-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/], 

        runtimeCaching: [
          {
            urlPattern: /\/api\/food\/list/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'food-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 
              }
            }
          },
          {
            urlPattern: /\/images\/.+\.(png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'food-images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7  
              }
            }
          }
        ]
      }
    })
  ],
})