import { expect, it } from 'vitest'
import { Controller } from '../Controller.js'
import { Application } from '../../models/Application.js'
import { Metadata } from '../Metadata.js'

it('adds controller to application', async () => {
  @Controller
  class Test {}

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].target).toBe(Test)
})

it('dont adds non registered controller to application', async () => {
  class Test {}

  const app = await new Application().register(Test).initialize()

  expect(app.controllers).toHaveLength(0)
})

it('adds metadata to controller', async () => {
  @Controller
  @Metadata('isTest', true)
  class Test {}

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].metadata.isTest).toBe(true)
})

it('overwrite metadata in controller', async () => {
  @Controller
  @Metadata('isTest', false)
  @Metadata('isTest', true)
  class Test {
    test() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].metadata.isTest).toBe(true)
})
