import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: "Mesinha",
        short_name: "Mesinha",
        description: "Shared Couple Lists App",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'figma:asset/0e6fc4aa02d7b49d595a04d3f9d46687997e37ef.png': path.resolve(__dirname, './src/assets/0e6fc4aa02d7b49d595a04d3f9d46687997e37ef.png'),
      'figma:asset/1f94cbc6275b0a35eb5a9c6c93b92d94e2251075.png': path.resolve(__dirname, './src/assets/1f94cbc6275b0a35eb5a9c6c93b92d94e2251075.png'),
      'figma:asset/75c872bdf2a28b8670edf0ef3851acf422588625.png': path.resolve(__dirname, './src/assets/75c872bdf2a28b8670edf0ef3851acf422588625.png'),
      'figma:asset/85f171ff8cd9cb4f7140b1d04b0f2e0ecceb0615.png': path.resolve(__dirname, './src/assets/85f171ff8cd9cb4f7140b1d04b0f2e0ecceb0615.png'),
      'figma:asset/870f87368b0cc75469636c24542ec183a844dabf.png': path.resolve(__dirname, './src/assets/870f87368b0cc75469636c24542ec183a844dabf.png'),
      'figma:asset/d35f9ee94ddbebc2679de29a725bb3a3047255e9.png': path.resolve(__dirname, './src/assets/d35f9ee94ddbebc2679de29a725bb3a3047255e9.png'),
      'figma:asset/dd4b98f23138814cb5d5f735480190b4a56f65a0.png': path.resolve(__dirname, './src/assets/dd4b98f23138814cb5d5f735480190b4a56f65a0.png')
    },
  },
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
