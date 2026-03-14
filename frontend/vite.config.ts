/// <reference types="vitest/config" />
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: false,
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    fileParallelism: false,
  },
})
