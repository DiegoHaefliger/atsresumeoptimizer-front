import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'
import { packExtension } from './scripts/pack-extension.mjs'

const EXTENSION_FILES = ['/ats-linkedin-extension.zip', '/ats-linkedin-extension.json']

function freshExtensionZip(): Plugin {
  return {
    name: 'fresh-extension-zip',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (EXTENSION_FILES.includes(request.url?.split('?')[0] ?? '')) {
          packExtension()
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), freshExtensionZip()],
  test: { environment: 'jsdom' },
})
