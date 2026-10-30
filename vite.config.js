import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const projectKey = createHash('sha256').update(projectRoot).digest('hex').slice(0, 12)

export default defineConfig({
  plugins: [react()],
  // Keep dependency caches outside Dropbox and separate for each checkout.
  cacheDir: join(tmpdir(), 'esports-tournament-manager', projectKey, 'vite'),
  server: {
    watch: {
      // Git ignores do not prevent Vite from watching local QA/browser files.
      ignored: ['**/*.local', '**/*.local/**'],
    },
  },
})
