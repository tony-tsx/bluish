import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
  test: {
    mockReset: true,
    coverage: {
      reporter: ['lcov', ['text', { skipFull: true }]],
      include: ['packages/*/src/**/*.ts'],
    },
  },
  plugins: [swc.vite()],
})
