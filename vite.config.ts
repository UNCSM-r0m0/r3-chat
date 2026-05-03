import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['host.docker.internal'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react-markdown') ||
            id.includes('react-syntax-highlighter') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('micromark') ||
            id.includes('mdast')
          ) {
            return 'markdown'
          }

          if (id.includes('mermaid')) return 'mermaid'
          if (id.includes('react-router')) return 'router'
          if (id.includes('lucide-react')) return 'icons'

          if (
            id.includes('zustand') ||
            id.includes('axios') ||
            id.includes('socket.io-client')
          ) {
            return 'state-net'
          }

          return 'vendor'
        },
      },
    },
  },
})
