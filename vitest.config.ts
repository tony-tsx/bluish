import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
  test: {
    mockReset: true,
    coverage: {
      include: ['**/src/**/*.ts'],
    },
    include: ['**/*.spec.ts'],
  },
  plugins: [swc.vite()],
})
