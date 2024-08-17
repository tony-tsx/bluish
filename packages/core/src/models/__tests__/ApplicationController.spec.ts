/* eslint-disable @typescript-eslint/no-unused-vars */
import { it, expect, beforeEach, describe } from 'vitest'
import { Controller } from '../../decorators/Controller.js'
import { Action } from '../../decorators/Action.js'
import { Application } from '../Application.js'
import BluishCoreTesting from '../../core-testing.js'
import { Metadata } from '../../decorators/Metadata.js'
import { Selector } from '../../decorators/Selector.js'
import { Inject } from '../../decorators/Inject.js'
import { Use } from '../../decorators/Use.js'
import { Pipe } from '../../decorators/Pipe.js'
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

  const app = await new Application().controller(Root).initialize()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(1)
})

it('adds instance action in controller', async () => {
  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

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

  const app = await new Application().controller(Root).initialize()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(2)
})

it('adds metadata in controller', async () => {
  @Controller
  @Metadata('isTest', true)
  class Root {}

  const app = await new Application().controller(Root).initialize()

  expect(
    Object.fromEntries(app.controllers.findByConstructable(Root)!.metadata),
  ).toEqual({
    isTest: true,
  })
})

it('overrides metadata in controller', async () => {
  @Controller
  @Metadata('isTest', false)
  @Metadata('isTest', true)
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

  expect(
    Object.fromEntries(app.controllers.findByConstructable(Root)!.metadata),
  ).toEqual({
    isTest: true,
  })
})

it('adds constructor argument selector in controller', async () => {
  @Controller
  class Root {
    constructor(@Selector(() => true) service: unknown) {}
  }

  const app = await new Application().controller(Root).initialize()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.arguments.selectors).toHaveLength(1)
})

it('adds instance property selector in controller', async () => {
  @Controller
  class Root {
    @Selector(() => true)
    public service: unknown
  }

  const app = await new Application().controller(Root).initialize()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.properties.selectors).toHaveLength(1)
})

it('adds static property selector in controller', async () => {
  @Controller
  class Root {
    @Selector(() => true)
    public static service: unknown
  }

  const app = await new Application().controller(Root).initialize()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.properties.selectors).toHaveLength(1)
})

it('adds constructor argument inject in controller', async () => {
  @Controller
  class Root {
    constructor(@Inject service: unknown) {}
  }

  const app = await new Application().controller(Root).initialize()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.arguments.injects).toHaveLength(1)
})

it('adds middleware in controller', async () => {
  @Controller
  @Use(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

  expect(app.controllers.findByConstructable(Root)!.middlewares).toHaveLength(1)
})

it('adds pipe in controller', async () => {
  @Controller
  @Pipe(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

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

  const app = await new Application().controller(Root).initialize()

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

  const app = await new Application().controller(Root).initialize()

  expect(app.controllers.findByConstructable(Root)!.actions).toHaveLength(2)
})

it('adds multiple middlewares in controller', async () => {
  @Controller
  @Use(() => {})
  @Use(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

  expect(app.controllers.findByConstructable(Root)!.middlewares).toHaveLength(2)
})

it('adds multiple pipes in controller', async () => {
  @Controller
  @Pipe(() => {})
  @Pipe(() => {})
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

  expect(app.controllers.findByConstructable(Root)!.pipes).toHaveLength(2)
})

it('build controller instance', async () => {
  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application().controller(Root).initialize()

  const context = new Context()

  await app.controllers
    .findByConstructable(Root)!
    .actions.findByPropertyKey('action')!
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

    const app = await new Application().controller(Root).initialize()
    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments.injects).toHaveLength(1)
    expect(controller.arguments.injects.get(0)!.ref).toBe(Service)
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

    const app = await new Application().controller(Root).initialize()
    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments.injects).toHaveLength(2)
    expect(controller.arguments.injects.get(0)!.ref).toBe(Service1)
    expect(controller.arguments.injects.get(1)!.ref).toBe(Service2)
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

    const app = await new Application().controller(Root).initialize()

    expect(
      app.controllers
        .findByConstructable(Root)!
        .properties.injects.get('service1')!.ref,
    ).toBe(Service1)
    expect(
      app.controllers
        .findByConstructable(Root)!
        .properties.injects.get('service2')!.ref,
    ).toBe(Service2)
  })

  it('adds injection in property', async () => {
    class Service {}

    @Controller
    class Root {
      @Inject
      public service!: Service
    }

    const app = await new Application().controller(Root).initialize()

    expect(
      app.controllers
        .findByConstructable(Root)!
        .properties.injects.get('service')!.ref,
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

    const app = await new Application().controller(Root).initialize()
    const controller = app.controllers.findByConstructable(Root)!

    expect(controller.arguments.injects).toHaveLength(2)
    expect(controller.arguments.injects.get(0)!.ref).toBe(Service1)
    expect(controller.arguments.injects.get(1)!.ref).toBe(Service2)

    expect(controller.properties.injects).toHaveLength(1)
    expect(controller.properties.injects.get('service3')!.ref).toBe(Service1)
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
    .controller(DecoratorController)
    .controller(Root)
    .initialize()

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
    .controller(DecoratorController)
    .controller(Root)
    .initialize()

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
    constructor(@Selector(() => true) service: unknown) {}
  }

  @Controller
  class Root {
    @Action
    public action() {}
  }

  const app = await new Application()
    .controller(DecoratorController)
    .controller(Root)
    .initialize()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.arguments.selectors).toHaveLength(1)
  expect(rootController.arguments.selectors).toHaveLength(0)
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
    .controller(DecoratorController)
    .controller(Root)
    .initialize()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.arguments.injects).toHaveLength(1)
  expect(rootController.arguments.injects).toHaveLength(0)
})

it("don't adds middlewares from decorators in another controller", async () => {
  @Controller
  @Use(() => {})
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
    .controller(DecoratorController)
    .controller(Root)
    .initialize()

  const decoratorController =
    app.controllers.findByConstructable(DecoratorController)!
  const rootController = app.controllers.findByConstructable(Root)!

  expect(decoratorController.middlewares).toHaveLength(1)
  expect(rootController.middlewares).toHaveLength(0)
})

it("don't adds pipes from decorators in another controller", async () => {
  @Controller
  @Pipe(() => {})
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
    .controller(DecoratorController)
    .controller(Root)
    .initialize()

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

  const app = await new Application().controller(Test).initialize()

  const controller = app.controllers.findByConstructable(Test)!

  const context = new Context()

  // @ts-expect-error: TODO
  context.action = controller.actions.findByPropertyKey('action')!

  const instance = await controller.toInstance(context)

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

  const app = await new Application().controller(Test).initialize()

  const controller = app.controllers.findByConstructable(Test)!

  const context = new Context()

  // @ts-expect-error: TODO
  context.action = controller.actions.findByPropertyKey('action')!

  const instance = await controller.toInstance(context)

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

  const app = await new Application().controller(Test).initialize()

  const controller = app.controllers.findByConstructable(Test)!

  expect(controller.target).toEqual(
    expect.objectContaining({
      service: expect.any(Service),
    }),
  )
})

it('adds action from extends controller', async () => {
  @Controller
  class Super {
    @Action
    public action() {}
  }

  @Controller
  class Root extends Super {}

  const app = await new Application().controller(Root).initialize()

  const controller = app.controllers.findByConstructable(Root)!

  expect(controller.actions).toHaveLength(1)
})
