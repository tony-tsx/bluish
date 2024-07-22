import { expect, it } from 'vitest'
import { Application } from '../Application.js'

it('isInitialized return false is not initialized', () => {
  const app = new Application()

  expect(app.isInitialized).toBe(false)
})

it('isInitialized return true is initialized', async () => {
  const app = await new Application().initialize()

  expect(app.isInitialized).toBe(true)
})
