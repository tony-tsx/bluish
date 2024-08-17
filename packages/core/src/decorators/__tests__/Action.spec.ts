import { beforeEach, expect, it } from 'vitest'
import BluishCoreTesting from '../../core-testing.js'
import { Action } from '../Action.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'
import { Context } from '../../models/Context.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds static action in metadata args storage', async () => {
  class Root {
    @Action
    public static action() {}
  }

  expect(getMetadataArgsStorage().actions).toEqual([
    expect.objectContaining({ target: Root, propertyKey: 'action' }),
  ])
})

it('adds action in metadata args storage', async () => {
  class Root {
    @Action
    public action() {}
  }

  expect(getMetadataArgsStorage().actions).toEqual([
    expect.objectContaining({ target: Root.prototype, propertyKey: 'action' }),
  ])
})

it('adds multiple actions in metadata args storage', async () => {
  class Root {
    @Action
    public static action1() {}

    @Action
    public static action2() {}

    @Action
    public action3() {}

    @Action
    public action4() {}
  }

  expect(getMetadataArgsStorage().actions).toEqual([
    expect.objectContaining({ target: Root, propertyKey: 'action1' }),
    expect.objectContaining({ target: Root, propertyKey: 'action2' }),
    expect.objectContaining({ target: Root.prototype, propertyKey: 'action3' }),
    expect.objectContaining({ target: Root.prototype, propertyKey: 'action4' }),
  ])
})

it('adds action with context in metadata args storage', async () => {
  class TestContext extends Context {}

  class Root {
    @Action(TestContext)
    public static action() {}
  }

  expect(getMetadataArgsStorage().actions).toEqual([
    expect.objectContaining({
      target: Root,
      propertyKey: 'action',
      context: TestContext,
    }),
  ])
})
