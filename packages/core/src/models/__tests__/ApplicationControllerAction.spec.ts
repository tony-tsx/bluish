import { describe, expect, it, vi } from 'vitest'
import { Application } from '../Application.js'
import { Controller } from '../../decorators/Controller.js'
import { Action } from '../../decorators/Action.js'
import { Context } from '../Context.js'
import { UseMiddleware } from '../../decorators/UseMiddleware.js'
import {
  Constructable,
  getMetadataArgsStorage,
  Inject,
  Injectable,
  Metadata,
  Middleware,
} from '../../core.js'
import BluishCoreTesting from '../../core-testing.js'

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

it('multiples middleware with differents contexts', async () => {
  class ContextLevel1 extends Context {}

  class ContextLevel2 extends ContextLevel1 {}

  class ContextLevel3 extends ContextLevel2 {}

  class ContextLevel4 extends ContextLevel3 {}

  const middlewareLevel0 = new Middleware(
    Context,
    vi.fn((_, next) => next()),
  )

  const middlewareLevel1 = new Middleware(
    ContextLevel1,
    vi.fn((_, next) => next()),
  )

  const middlewareLevel2 = new Middleware(
    ContextLevel2,
    vi.fn((_, next) => next()),
  )

  const middlewareLevel3 = new Middleware(
    ContextLevel3,
    vi.fn((_, next) => next()),
  )

  const middlewareLevel4 = new Middleware(
    ContextLevel4,
    vi.fn((_, next) => next()),
  )

  @Controller
  class Test {
    @Action
    @UseMiddleware(middlewareLevel0)
    @UseMiddleware(middlewareLevel1)
    @UseMiddleware(middlewareLevel2)
    @UseMiddleware(middlewareLevel3)
    @UseMiddleware(middlewareLevel4)
    public action() {}
  }

  const application = await new Application().useController(Test).bootstrap()

  const action = application.controllers
    .findByConstructable(Test)!
    .actions.findByInstancePropertyKey('action')!

  expect(action.middlewares).toHaveLength(5)

  await action.run(new Context())

  expect(middlewareLevel0.run).toHaveBeenCalledTimes(1)
  expect(middlewareLevel1.run).toHaveBeenCalledTimes(0)
  expect(middlewareLevel2.run).toHaveBeenCalledTimes(0)
  expect(middlewareLevel3.run).toHaveBeenCalledTimes(0)
  expect(middlewareLevel4.run).toHaveBeenCalledTimes(0)

  await action.run(new ContextLevel1())

  expect(middlewareLevel0.run).toHaveBeenCalledTimes(2)
  expect(middlewareLevel1.run).toHaveBeenCalledTimes(1)
  expect(middlewareLevel2.run).toHaveBeenCalledTimes(0)
  expect(middlewareLevel3.run).toHaveBeenCalledTimes(0)
  expect(middlewareLevel4.run).toHaveBeenCalledTimes(0)

  await action.run(new ContextLevel2())

  expect(middlewareLevel0.run).toHaveBeenCalledTimes(3)
  expect(middlewareLevel1.run).toHaveBeenCalledTimes(2)
  expect(middlewareLevel2.run).toHaveBeenCalledTimes(1)
  expect(middlewareLevel3.run).toHaveBeenCalledTimes(0)
  expect(middlewareLevel4.run).toHaveBeenCalledTimes(0)

  await action.run(new ContextLevel3())

  expect(middlewareLevel0.run).toHaveBeenCalledTimes(4)
  expect(middlewareLevel1.run).toHaveBeenCalledTimes(3)
  expect(middlewareLevel2.run).toHaveBeenCalledTimes(2)
  expect(middlewareLevel3.run).toHaveBeenCalledTimes(1)
  expect(middlewareLevel4.run).toHaveBeenCalledTimes(0)

  await action.run(new ContextLevel4())

  expect(middlewareLevel0.run).toHaveBeenCalledTimes(5)
  expect(middlewareLevel1.run).toHaveBeenCalledTimes(4)
  expect(middlewareLevel2.run).toHaveBeenCalledTimes(3)
  expect(middlewareLevel3.run).toHaveBeenCalledTimes(2)
  expect(middlewareLevel4.run).toHaveBeenCalledTimes(1)
})

it('adds action metadata by action metadata argument', async () => {
  @Controller
  class Root {
    public static act() {}
  }

  getMetadataArgsStorage().actions.push({
    type: 'action',
    target: Root,
    metadata: { isTest: true },
    propertyKey: 'act',
  })

  const application = await new Application().useController(Root).bootstrap()

  expect(
    application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('act')!
      .metadata.get('isTest'),
  ).toBe(true)
})

it('adds action metadata (symbol) by action metadata argument', async () => {
  const IS_TEST = Symbol()

  @Controller
  class Root {
    public static act() {}
  }

  getMetadataArgsStorage().actions.push({
    type: 'action',
    target: Root,
    metadata: { [IS_TEST]: true },
    propertyKey: 'act',
  })

  const application = await new Application().useController(Root).bootstrap()

  expect(
    application.controllers
      .findByConstructable(Root)!
      .actions.findByStaticPropertyKey('act')!
      .metadata.get(IS_TEST),
  ).toBe(true)
})

it('call action decorator function virtually', async () => {
  const context = new Context()

  function TestController(target: Constructable) {
    Controller(target)
    Action(() => 'testResult')(target)
  }
  @TestController
  class Root {}

  const application = await new Application().useController(Root).bootstrap()

  const actions = application.controllers.findByConstructable(Root)!.actions
  const action = Array.from(actions).pop()

  await action!.run(context)

  expect(context.return).toBe('testResult')
})

it('middleware catch injectable throw', async () => {
  class ServiceError extends Error {}

  @Injectable('context')
  class Service {
    constructor() {
      throw new ServiceError()
    }
  }

  @Controller
  @UseMiddleware(async (context, next) => {
    try {
      await next()
    } catch (error) {
      if (!(error instanceof ServiceError)) throw error

      context.error = error
    }
  })
  class Root {
    @Action
    public static act(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      @Inject(() => Service) _service: Service,
    ) {}
  }

  await expect(BluishCoreTesting.run(Root, 'act')).resolves.toEqual(
    expect.objectContaining({ error: expect.any(ServiceError) }),
  )
})
