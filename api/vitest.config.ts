import { resolve } from 'path'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: './',
    globals: true,
    include: ['src/**/*.spec.ts']
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared/src')
    }
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' }
    })
  ]
})
