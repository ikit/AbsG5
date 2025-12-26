import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'v-emoji-picker': 'vue3-emoji-picker', // Alias old emoji picker to new one
      'vuex': fileURLToPath(new URL('./src/stores/helpers.js', import.meta.url)) // Redirect Vuex to Pinia helpers
    }
  },
  server: {
    port: 8080,
    fs: {
      strict: false
    },
    watch: {
      usePolling: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5011',
        ws: true,
      },
    }
  },
  optimizeDeps: {
    include: ['vuetify', 'vue', 'vue-router', 'pinia', 'axios']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        // OPTIMIZED: Feature-based code splitting for better caching and lazy loading
        manualChunks(id) {
          // Core Vue framework - loaded on every page
          if (id.includes('vue') && !id.includes('node_modules/vuetify')) {
            return 'vue-vendor'
          }
          if (id.includes('pinia') || id.includes('vue-router')) {
            return 'vue-vendor'
          }

          // UI Framework - loaded on every page
          if (id.includes('vuetify') || id.includes('@mdi/font')) {
            return 'vuetify'
          }

          // Feature: AGPA (photo contest) - only loaded when visiting /agpa
          if (id.includes('/views/Agpa/') || id.includes('/stores/agpa')) {
            return 'feature-agpa'
          }

          // Feature: Forum - only loaded when visiting /forum
          if (id.includes('/views/Forum/')) {
            return 'feature-forum'
          }

          // Feature: Photos - only loaded when visiting /photos
          if (id.includes('/views/Photos/')) {
            return 'feature-photos'
          }

          // Feature: Admin - only loaded when visiting /admin
          if (id.includes('/views/Admin/')) {
            return 'feature-admin'
          }

          // Feature: Agenda - only loaded when visiting /agenda
          if (id.includes('/views/Agenda/')) {
            return 'feature-agenda'
          }

          // Feature: GTheque - only loaded when visiting /gtheque
          if (id.includes('/views/Gtheque/') || id.includes('/views/GTheque')) {
            return 'feature-gtheque'
          }

          // Feature: Citations - only loaded when visiting /citations
          if (id.includes('/views/Citations/')) {
            return 'feature-citations'
          }

          // Rich Text Editor (TipTap) - only loaded in Forum
          if (id.includes('@tiptap/')) {
            return 'lib-editor'
          }

          // Charts (Highcharts) - only loaded in GTheque and stats pages
          if (id.includes('highcharts')) {
            return 'lib-charts'
          }

          // Image manipulation - only loaded in photo editor
          if (id.includes('cropperjs') || id.includes('jimp')) {
            return 'lib-image'
          }

          // Common utilities - loaded when needed
          if (id.includes('axios')) {
            return 'lib-http'
          }
          if (id.includes('date-fns')) {
            return 'lib-date'
          }
          if (id.includes('localforage') || id.includes('webdav')) {
            return 'lib-storage'
          }

          // All other node_modules - group by size threshold
          if (id.includes('node_modules')) {
            // Large libraries get their own chunk
            if (id.includes('reveal.js')) {
              return 'lib-reveal'
            }
            // Medium-sized libraries
            return 'vendor-utils'
          }
        }
      }
    }
  }
})
