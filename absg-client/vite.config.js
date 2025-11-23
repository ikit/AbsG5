import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 2 // Vue 2 compatibility mode
          }
        }
      }
    }),
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
      'vue': '@vue/compat', // Use Vue 3 compatibility build
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
    include: ['vuetify', 'vue', 'vue-router', 'pinia', 'axios'],
    exclude: ['@vue/compat']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'vuetify': ['vuetify'],
          'charts': ['highcharts', 'highcharts-vue'],
          'editor': ['@tiptap/vue-3', '@tiptap/starter-kit', '@tiptap/extension-color', '@tiptap/extension-text-style'],
          'utils': ['axios', 'date-fns', 'localforage', 'md5', 'webdav'],
        }
      }
    }
  }
})
