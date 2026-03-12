import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildInput = {
  app: resolve(__dirname, 'index.html'),
  redirect: resolve(__dirname, 'redirect.html'),
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: buildInput,
    },
  },
})
