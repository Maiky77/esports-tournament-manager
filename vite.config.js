import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const projectKey = createHash('sha256').update(projectRoot).digest('hex').slice(0, 12)

// CSP estricta solo en el build (en desarrollo Vite necesita scripts inline para HMR).
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const injectCsp = {
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml: (html) => html.replace('</head>', `    <meta http-equiv="Content-Security-Policy" content="${csp}" />\n  </head>`),
}

export default defineConfig({
  plugins: [react(), injectCsp],
  // Keep dependency caches outside Dropbox and separate for each checkout.
  cacheDir: join(tmpdir(), 'esports-tournament-manager', projectKey, 'vite'),
  server: {
    watch: {
      // Git ignores do not prevent Vite from watching local QA/browser files.
      ignored: ['**/*.local', '**/*.local/**'],
    },
  },
})
