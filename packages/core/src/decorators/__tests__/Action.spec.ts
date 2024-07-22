import { expect, it } from 'vitest'
import { Action } from '../Action.js'
import { Context } from '../../models/Context.js'
import { Application } from '../../models/Application.js'
import { Controller } from '../Controller.js'
import { Metadata } from '../Metadata.js'

it('adds action', async () => {
  @Controller
  class Test {
    @Action(Context)
    public act() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].actions).toHaveLength(1)
})

it('adds static action', async () => {
  @Controller
  class Test {
    @Action(Context)
    public static act() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].actions).toHaveLength(1)
})

it('adds metadata in action', async () => {
  @Controller
  class Test {
    @Action(Context)
    @Metadata('isTest', true)
    public act() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].actions[0].metadata.isTest).toBe(true)
})

it('overwrite metadata in action', async () => {
  @Controller
  class Test {
    @Action(Context)
    @Metadata('isTest', false)
    @Metadata('isTest', true)
    public act() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].actions[0].metadata.isTest).toBe(true)
})

it('adds metadata in static action', async () => {
  @Controller
  class Test {
    @Action(Context)
    @Metadata('isTest', true)
    public static act() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].actions[0].metadata.isTest).toBe(true)
})

it('overwrite metadata in static action', async () => {
  @Controller
  class Test {
    @Action(Context)
    @Metadata('isTest', false)
    @Metadata('isTest', true)
    public static act() {}
  }

  const app = await new Application().register(Test).initialize()

  expect(app.controllers[0].actions[0].metadata.isTest).toBe(true)
})
