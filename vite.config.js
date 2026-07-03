import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 部署：base 设为仓库名
// 如果仓库名是 nightfall-city，改为 '/nightfall-city/'
// 如果用用户页 user.github.io，则设为 '/'
const BASE = process.env.GITHUB_PAGES_BASE || '/'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon-192.svg', 'pwa-icon-512.svg'],
      manifest: {
        name: '暗夜都市 — Nightfall City',
        short_name: '暗夜都市',
        description: '都市奇幻 TRPG 网页游戏',
        theme_color: '#0D0D0D',
        background_color: '#0D0D0D',
        display: 'standalone',
        start_url: BASE + '/',
        scope: BASE + '/',
        icons: [
          {
            src: 'pwa-icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/leaderboard$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'leaderboard-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 3600 }
            }
          }
        ]
      }
    })
  ],
  base: BASE,
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})
