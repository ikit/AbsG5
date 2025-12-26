import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import fs from 'node:fs'
import path from 'node:path'

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
    // Improve dev server performance with many chunks
    hmr: {
      overlay: true
    },
    // Increase chunk loading timeout
    preTransformRequests: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5011',
        ws: true,
      },
      '/files': {
        target: 'http://localhost:5010',
        changeOrigin: true,
      },
    },
    // Serve static files directly from local directory
    middlewareMode: false,
  },
  // Configure Vite server to handle /files route
  configureServer(server) {
    const filesPath = 'C:\\Users\\ogueu\\Documents\\git\\ABSG_FILES'
    console.log(`📁 Serving /files from ${filesPath}`)

    // MIME types mapping
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
    }

    // Add middleware directly
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/files/')) {
        // Remove query parameters
        const cleanUrl = req.url.split('?')[0]
        const relPath = cleanUrl.replace('/files/', '')
        const filePath = path.join(filesPath, relPath)

        console.log(`🔍 Request: ${cleanUrl}`)
        console.log(`📂 Looking for: ${filePath}`)

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          // Detect MIME type
          const ext = path.extname(filePath).toLowerCase()
          const mimeType = mimeTypes[ext] || 'application/octet-stream'

          console.log(`✓ Serving file: ${cleanUrl} (${mimeType})`)
          res.setHeader('Content-Type', mimeType)
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Cache-Control', 'public, max-age=31536000')

          const stream = fs.createReadStream(filePath)
          stream.pipe(res)
          stream.on('error', (err) => {
            console.error(`✗ Error reading file: ${err.message}`)
            res.statusCode = 500
            res.end('Internal Server Error')
          })
        } else {
          console.log(`✗ File not found: ${filePath}`)
          res.statusCode = 404
          res.end('File not found')
        }
      } else {
        next()
      }
    })
  },
  optimizeDeps: {
    include: [
      'vuetify',
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'date-fns',
      'localforage',
      'md5',
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      'highcharts',
      'highcharts-vue'
    ],
    exclude: [],
    // Force dependency optimization on server start
    force: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // SIMPLIFIED: Reduce chunk count for better dev performance
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core framework - Vue, Router, Pinia
          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
            return 'framework'
          }

          // UI Framework - Vuetify
          if (id.includes('vuetify') || id.includes('@mdi/font')) {
            return 'ui'
          }

          // Heavy libraries - split only the biggest ones
          if (id.includes('highcharts')) {
            return 'charts'
          }
          if (id.includes('@tiptap/')) {
            return 'editor'
          }

          // Everything else from node_modules goes into vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
