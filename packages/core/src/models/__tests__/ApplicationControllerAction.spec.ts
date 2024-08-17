import { describe, expect, it, vi } from 'vitest'
import { Application } from '../Application.js'
import { Controller } from '../../decorators/Controller.js'
import { Action } from '../../decorators/Action.js'
import { Context } from '../Context.js'
import { Use } from '../../decorators/Use.js'

describe('.run', () => {
  it('run static action', async () => {
    @Controller
    class Root {
      @Action
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().controller(Root).initialize()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findStaticByPropertyKey('action')!
      .run(new Context())
  })

  it('run instance action', async () => {
    @Controller
    class Root {
      @Action
      public action() {}
    }

    vi.spyOn(Root.prototype, 'action')

    const application = await new Application().controller(Root).initialize()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByPropertyKey('action')!
      .run(new Context())
  })

  it('run middleware', async () => {
    const middleware = vi.fn()

    @Controller
    class Root {
      @Action
      @Use(middleware)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().controller(Root).initialize()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findStaticByPropertyKey('action')!
      .run(new Context())

    expect(middleware).toHaveBeenCalledWith(
      expect.any(Context),
      expect.any(Function),
    )
  })

  it('run middleware with specific context', async () => {
    const middleware = vi.fn()

    class TestContext extends Context {}

    @Controller
    class Root {
      @Action
      @Use(middleware)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().controller(Root).initialize()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findStaticByPropertyKey('action')!
      .run(new TestContext())

    expect(middleware).toHaveBeenCalledWith(
      expect.any(Context),
      expect.any(Function),
    )
  })

  it("don't run middleware with different context", async () => {
    const middleware = vi.fn()

    class TestContext extends Context {}

    @Controller
    class Root {
      @Action
      @Use(TestContext, middleware)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().controller(Root).initialize()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findStaticByPropertyKey('action')!
      .run(new Context())

    expect(middleware).not.toHaveBeenCalled()
  })

  it('run multiple middlewares', async () => {
    const middleware1 = vi.fn((context, next) => next())
    const middleware2 = vi.fn((context, next) => next())

    @Controller
    class Root {
      @Action
      @Use(middleware1)
      @Use(middleware2)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().controller(Root).initialize()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findStaticByPropertyKey('action')!
      .run(new Context())

    expect(middleware1).toHaveBeenCalledWith(
      expect.any(Context),
      expect.any(Function),
    )

    expect(middleware2).toHaveBeenCalledWith(
      expect.any(Context),
      expect.any(Function),
    )

    expect(Root.action).toHaveBeenCalled()
  })
})
