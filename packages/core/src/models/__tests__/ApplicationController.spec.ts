/* eslint-disable @typescript-eslint/no-unused-vars */
import { it, expect, beforeEach, describe, vi } from 'vitest'
import { Controller } from '../../decorators/Controller.js'
import { Action } from '../../decorators/Action.js'
import { Application } from '../Application.js'
import BluishCoreTesting from '../../core-testing.js'
import { Metadata } from '../../decorators/Metadata.js'
import { Input } from '../../decorators/Input.js'
import { Inject } from '../../decorators/Inject.js'
import { UseMiddleware } from '../../decorators/UseMiddleware.js'
import { UsePipe } from '../../decorators/UsePipe.js'
import { Context } from '../Context.js'
import { Injectable } from '../../decorators/Injectable.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds static action in controller', async () => {
  @Controller
  class Root {
    @Action
    public static action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(1)
})

it('adds instance action in controller', async () => {
  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(1)
})

it('adds multiple actions in controller', async () => {
  @Controller
  class Root {
    @Action
    public action() {}

    @Action
    public action2() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(2)
})

it('adds metadata in controller', async () => {
  @Controller
  @Metadata('isTest', true)
  class Root {}

  const app = await new Application().useController(Root).bootstrap()

  expect(
    Object.fromEntries(app.controllers.findByConstructable(Root)!.metadata),
  ).toEqual({
    isTest: true,
  })
})

it('overrides metadata in controller', async () => {
  @Controller
  @Metadata('isTest', true)
  @Metadata('isTest', false)
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(
    Object.fromEntries(app.controllers.findByConstructable(Root)!.metadata),
  ).toEqual({
    isTest: true,
  })
})

it('overrides metadata in controller inherith', async () => {
  @Controller
  @Metadata('isTest', false)
  class Parent {
    @Action
    public action() {}
  }

  @Controller
  @Metadata('isTest', true)
  class Root extends Parent {}

  const app = await new Application().useController(Root).bootstrap()

  expect(
    Object.fromEntries(app.controllers.findByConstructable(Root)!.metadata),
  ).toEqual({
    isTest: true,
  })
})

it('adds constructor argument selector in controller', async () => {
  @Controller
  class Root {
    constructor(@Input(() => true) service: unknown) {}
  }

  const app = await new Application().useController(Root).bootstrap()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.arguments.get(0)?.input).toHaveLength(1)
})

it('adds instance property selector in controller', async () => {
  @Controller
  class Root {
    @Input(() => true)
    public service: unknown
  }

  const app = await new Application().useController(Root).bootstrap()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.properties.get('service')?.input).toHaveLength(1)
})

it('adds static property selector in controller', async () => {
  @Controller
  class Root {
    @Input(() => true)
    public static service: unknown
  }

  const app = await new Application().useController(Root).bootstrap()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.static.get('service')).toBeDefined()
})

it('adds constructor argument inject in controller', async () => {
  @Controller
  class Root {
    constructor(@Inject service: unknown) {}
  }

  const app = await new Application().useController(Root).bootstrap()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.arguments.get(0)?.inject).toBeDefined()
})

it('adds middleware in controller', async () => {
  @Controller
  @UseMiddleware(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.middlewares).toHaveLength(1)
})

it('adds pipe in controller', async () => {
  @Controller
  @UsePipe(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.pipes).toHaveLength(1)
})

it('adds multiple static actions in controller', async () => {
  @Controller
  class Root {
    @Action
    public static action1() {}

    @Action
    public static action2() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(2)
})

it('adds multiple instance actions in controller', async () => {
  @Controller
  class Root {
    @Action
    public action1() {}

    @Action
    public action2() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(2)
})

it('adds multiple middlewares in controller', async () => {
  @Controller
  @UseMiddleware(() => {})
  @UseMiddleware(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.middlewares).toHaveLength(2)
})

it('adds multiple pipes in controller', async () => {
  @Controller
  @UsePipe(() => {})
  @UsePipe(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  expect(app.controllers.findByConstructable(Root)!.pipes).toHaveLength(2)
})

it('build controller instance', async () => {
  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  const context = new Context()

  await app.controllers
    .findByConstructable(Root)!
    .actions.findByInstancePropertyKey('action')!
    .run(context)

  expect(context.target).toBeInstanceOf(Root)
})

describe('reflect metadata design:paramtypes', async () => {
  await import('reflect-metadata')

  it('adds injection', async () => {
    class Service {}

    @Controller
    class Root {
      constructor(public service: Service) {}
    }

    const app = await new Application().useController(Root).bootstrap()
    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments).toHaveLength(1)
    expect(controller.arguments.get(0)!.inject!.ref).toBe(Service)
  })

  it('adds multiple injections by metadata in constructor', async () => {
    class Service1 {}
    class Service2 {}

    @Controller
    class Root {
      constructor(
        @Inject public service1: Service1,
        @Inject public service2: Service2,
      ) {}
    }

    const app = await new Application().useController(Root).bootstrap()
    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments).toHaveLength(2)
    expect(controller.arguments.get(0)!.inject!.ref).toBe(Service1)
    expect(controller.arguments.get(1)!.inject!.ref).toBe(Service2)
  })

  it('adds multiple injections by metadata in property', async () => {
    class Service1 {}
    class Service2 {}

    @Controller
    class Root {
      @Inject
      public service1!: Service1

      @Inject
      public service2!: Service2
    }

    const app = await new Application().useController(Root).bootstrap()

    expect(
      app.controllers.findByConstructable(Root)!.properties.get('service1')!
        .inject!.ref,
    ).toBe(Service1)
    expect(
      app.controllers.findByConstructable(Root)!.properties.get('service2')!
        .inject!.ref,
    ).toBe(Service2)
  })

  it('adds injection in property', async () => {
    class Service {}

    @Controller
    class Root {
      @Inject
      public service!: Service
    }

    const app = await new Application().useController(Root).bootstrap()

    expect(
      app.controllers.findByConstructable(Root)!.properties.get('service')!
        .inject!.ref,
    ).toBe(Service)
  })

  it('adds injection in constructor argument and property', async () => {
    class Service1 {}
    class Service2 {}

    @Controller
    class Root {
      constructor(
        @Inject public service1: Service1,
        @Inject public service2: Service2,
      ) {}

      @Inject
      public service3!: Service1
    }

    const app = await new Application().useController(Root).bootstrap()
    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments).toHaveLength(2)
    expect(controller.arguments.get(0)!.inject!.ref).toBe(Service1)
    expect(controller.arguments.get(1)!.inject!.ref).toBe(Service2)

    expect(controller.properties).toHaveLength(1)
    expect(controller.properties.get('service3')!.inject!.ref).toBe(Service1)
  })
})

it('adds actions from decorators in another controller', async () => {
  @Controller
  class DecoratorController {
    @Action
    public action() {}
  }

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .useController(DecoratorController)
    .useController(Root)
    .bootstrap()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.actions).toHaveLength(1)
  expect(rootController.actions).toHaveLength(1)
})

it('adds metadata from decorators in another controller', async () => {
  @Controller
  @Metadata('isTest', true)
  class DecoratorController {}

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .useController(DecoratorController)
    .useController(Root)
    .bootstrap()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(Object.fromEntries(decoratorController.metadata)).toEqual({
    isTest: true,
  })
  expect(Object.fromEntries(rootController.metadata)).toEqual({})
})

it("don't adds selectors from decorators in another controller", async () => {
  @Controller
  class DecoratorController {
    constructor(@Input(() => true) service: unknown) {}
  }

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .useController(DecoratorController)
    .useController(Root)
    .bootstrap()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.arguments).toHaveLength(1)
  expect(rootController.arguments).toHaveLength(0)
})

it("don't adds injects from decorators in another controller", async () => {
  @Controller
  class DecoratorController {
    constructor(@Inject service: unknown) {}
  }

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .useController(DecoratorController)
    .useController(Root)
    .bootstrap()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.arguments).toHaveLength(1)
  expect(rootController.arguments).toHaveLength(0)
})

it("don't adds middlewares from decorators in another controller", async () => {
  @Controller
  @UseMiddleware(() => {})
  class DecoratorController {
    @Action
    public action() {}
  }

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .useController(DecoratorController)
    .useController(Root)
    .bootstrap()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.middlewares).toHaveLength(1)
  expect(rootController.middlewares).toHaveLength(0)
})

it("don't adds pipes from decorators in another controller", async () => {
  @Controller
  @UsePipe(() => {})
  class DecoratorController {
    @Action
    public action() {}
  }

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .useController(DecoratorController)
    .useController(Root)
    .bootstrap()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.pipes).toHaveLength(1)
  expect(rootController.pipes).toHaveLength(0)
})

it('adds injectable dependency in constructor arguments', async () => {
  @Injectable
  class Service {}

  @Controller
  class Test {
    constructor(@Inject(() => Service) public readonly service: Service) {}

    @Action
    public action() {}
  }

  const app = await new Application().useController(Test).bootstrap()

  const controller = app.controllers.findByConstructable(Test)!

  const context = new Context()

  // @ts-expect-error: TODO
  context.action = controller.actions.findByInstancePropertyKey('action')!

  const instance = await controller.construct(context, instance => instance)

  expect(instance).toBeInstanceOf(Test)
  expect(instance.service).toBeInstanceOf(Service)
})

it('adds injectable dependency in class properties', async () => {
  @Injectable
  class Service {}

  @Controller
  class Test {
    @Inject(() => Service)
    public readonly service!: Service

    constructor() {}

    @Action
    public action() {}
  }

  const app = await new Application().useController(Test).bootstrap()

  const controller = app.controllers.findByConstructable(Test)!

  const context = new Context()

  // @ts-expect-error: TODO
  context.action = controller.actions.findByInstancePropertyKey('action')!

  const instance = await controller.construct(context, instance => instance)

  expect(instance).toBeInstanceOf(Test)
  expect(instance.service).toBeInstanceOf(Service)
})

it('adds injectable dependency in static class properties', async () => {
  @Injectable
  class Service {}

  @Controller
  class Test {
    @Inject(() => Service)
    public static readonly service: Service
  }

  const app = await new Application().useController(Test).bootstrap()

  const controller = app.controllers.findByConstructable(Test)!

  expect(controller.target).toEqual(
    expect.objectContaining({
      service: expect.any(Service),
    }),
  )
})

describe('inheritance', () => {
  it('inherits middleware', async () => {
    const middleware = vi.fn()
    @UseMiddleware(middleware)
    class Parent {}

    @Controller({ inherits: { middlewares: true } })
    class Root extends Parent {}

    const app = await new Application().useController(Root).bootstrap()

    expect(app.controllers.findByConstructable(Root)!.middlewares).toHaveLength(
      1,
    )
  })

  it('inherits action', async () => {
    @Controller
    class Super {
      @Action
      public action() {}
    }

    @Controller({ inherits: { actions: true } })
    class Root extends Super {}

    const app = await new Application().useController(Root).bootstrap()

    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.actions).toHaveLength(1)
  })

  it('inherits metadata', async () => {
    @Controller
    @Metadata('isTest', true)
    class Parent {}

    @Controller({ inherits: { metadata: true } })
    class Root extends Parent {}

    const app = await new Application().useController(Root).bootstrap()

    expect(
      Object.fromEntries(app.controllers.findByConstructable(Root)!.metadata),
    ).toEqual({
      isTest: true,
    })
  })

  it('inherits selectors', async () => {
    @Controller
    class Parent {
      constructor(@Input(() => true) service: unknown) {}
    }

    @Controller({ inherits: { selectors: true } })
    class Root extends Parent {}

    const app = await new Application().useController(Root).bootstrap()

    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments).toHaveLength(1)
  })

  it('inherits injects', async () => {
    @Controller
    class Parent {
      constructor(@Inject service: unknown) {}
    }

    @Controller({ inherits: { injects: true } })
    class Root extends Parent {}

    const app = await new Application().useController(Root).bootstrap()

    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments.get(0)?.inject).toBeDefined()
  })

  it('inherits multiple actions', async () => {
    @Controller
    class Parent {
      @Action
      public action1() {}

      @Action
      public action2() {}
    }

    @Controller({ inherits: { actions: true } })
    class Root extends Parent {}

    const app = await new Application().useController(Root).bootstrap()

    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.actions).toHaveLength(2)
  })

  describe("don't", () => {
    it('inherits middleware', async () => {
      const middleware = vi.fn()
      @UseMiddleware(middleware)
      class Parent {}

      @Controller({ inherits: { middlewares: false } })
      class Root extends Parent {}

      const app = await new Application().useController(Root).bootstrap()

      expect(
        app.controllers.findByConstructable(Root)!.middlewares,
      ).toHaveLength(0)
    })

    it('inherits action', async () => {
      @Controller
      class Super {
        @Action
        public action() {}
      }

      @Controller({ inherits: { actions: false } })
      class Root extends Super {}

      const app = await new Application().useController(Root).bootstrap()

      const controller = app.controllers.findByConstructable(Root)!

      expect(controller.actions).toHaveLength(0)
    })
  })
})

it('input with dependencies', async () => {
  @Controller
  class Test {
    @Input(() => 123)
    public number!: unknown

    @Input(
      function () {
        expect(this.number).toBe(123)

        return this.number
      },
      ['number'],
    )
    public number2!: unknown

    constructor() {}

    @Action
    public action() {}
  }

  const app = await new Application().useController(Test).bootstrap()

  const controller = app.controllers.findByConstructable(Test)!

  const context = new Context()

  // @ts-expect-error: TODO
  context.action = controller.actions.findByInstancePropertyKey('action')!

  const instance = await controller.construct(context, instance => instance)

  expect(instance).toEqual({
    number: 123,
    number2: 123,
  })
})
