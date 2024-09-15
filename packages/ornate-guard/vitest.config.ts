import { mergeConfig } from 'vitest/config'
import config from '../../vitest.config.js'

export default mergeConfig(config, {
  test: {
    coverage: {
      include: ['src/**/*.ts'],
    },
  },
})
