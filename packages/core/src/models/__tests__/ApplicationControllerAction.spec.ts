import { describe, expect, it, vi } from 'vitest'
import { Application } from '../Application.js'
import { Controller } from '../../decorators/Controller.js'
import { Action } from '../../decorators/Action.js'
import { Context } from '../Context.js'
import { UseMiddleware } from '../../decorators/UseMiddleware.js'
import { Metadata } from '../../core.js'

describe('.run', () => {
  it('run static action', async () => {
    @Controller
    class Root {
      @Action
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().useController(Root).bootstrap()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('action')!
      .run(new Context())
  })

  it('run instance action', async () => {
    @Controller
    class Root {
      @Action
      public action() {}
    }

    vi.spyOn(Root.prototype, 'action')

    const application = await new Application().useController(Root).bootstrap()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByInstancePropertyKey('action')!
      .run(new Context())
  })

  it('run middleware', async () => {
    const middleware = vi.fn()

    @Controller
    class Root {
      @Action
      @UseMiddleware(middleware)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().useController(Root).bootstrap()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('action')!
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
      @UseMiddleware(middleware)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().useController(Root).bootstrap()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('action')!
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
      @UseMiddleware(TestContext, middleware)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().useController(Root).bootstrap()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('action')!
      .run(new Context())

    expect(middleware).not.toHaveBeenCalled()
  })

  it('run multiple middlewares', async () => {
    const middleware1 = vi.fn((context, next) => next())
    const middleware2 = vi.fn((context, next) => next())

    @Controller
    class Root {
      @Action
      @UseMiddleware(middleware1)
      @UseMiddleware(middleware2)
      public static action() {}
    }

    vi.spyOn(Root, 'action')

    const application = await new Application().useController(Root).bootstrap()

    await application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('action')!
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

describe('reflect-metadata', async () => {
  await import('reflect-metadata')

  it('adds injectable ref in static action', async () => {
    @Controller
    class Test {
      @Action
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      public static action(arg: string) {}
    }

    const application = await new Application().useController(Test).bootstrap()

    expect(
      application.controllers
        .findByConstructable(Test)!
        .actions.findByStaticPropertyKey('action')!
        .arguments.get(0)!.inject!.ref,
    ).toBe(String)
  })
})

it('adds action metadata', async () => {
  @Controller
  class Test {
    @Action
    @Metadata('isTest', true)
    public action() {}
  }

  const application = await new Application().useController(Test).bootstrap()

  expect(
    application.controllers
      .findByConstructable(Test)!
      .actions.findByInstancePropertyKey('action')!
      .metadata.get('isTest'),
  ).toBe(true)
})
