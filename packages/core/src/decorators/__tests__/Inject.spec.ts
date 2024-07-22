/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, it } from 'vitest'
import { Controller } from '../Controller.js'
import { Injectable } from '../Injectable.js'
import { Inject } from '../Inject.js'
import { Action } from '../Action.js'
import { Context } from '../../models/Context.js'
import { Application } from '../../models/Application.js'
import { toRunner } from '../../tools/toRunner.js'

it('adds injectable in app', async () => {
  @Injectable
  class Service {}

  const app = await new Application().initialize()

  expect(app.injectables).toHaveLength(1)
})

it('adds injectable to controller witch static reference', async () => {
  @Injectable
  class Service {}

  @Controller
  class TestController {
    @Inject(() => Service)
    public static readonly service: Service

    @Action(Context)
    public static act() {}
  }

  const app = await new Application().register(TestController).initialize()

  expect(app.controllers[0].injections.static).toHaveLength(1)
})

it('access injectable instance in controller static property', async () => {
  @Injectable
  class Service {}

  @Controller
  class TestController {
    @Inject(() => Service)
    public static readonly service: Service

    @Action(Context)
    public static act() {}
  }

  const app = await new Application().register(TestController).initialize()

  expect(app.controllers[0].target).toEqual(
    expect.objectContaining({
      service: expect.any(Service),
    }),
  )
})

it('adds injectable in controller property', async () => {
  @Injectable
  class Service {}

  @Controller
  class TestController {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {}
  }

  const app = await new Application().register(TestController).initialize()

  expect(app.controllers[0].injections.properties).toHaveLength(1)
})

it('access injectable instance in controller property', async () => {
  @Injectable
  class Service {}

  @Controller
  class TestController {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {
      expect(this.service).toBeInstanceOf(Service)
    }
  }

  const app = await new Application().register(TestController).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('adds injectable in controller constructor', async () => {
  @Injectable
  class Service {}

  @Controller
  class TestController {
    constructor(@Inject(() => Service) service: Service) {}

    @Action(Context)
    public act() {}
  }

  const app = await new Application().register(TestController).initialize()

  expect(app.controllers[0].injections.constructor).toHaveLength(1)
})

it('access injectable instance in controller constructor', async () => {
  @Injectable
  class Service {}

  @Controller
  class TestController {
    constructor(@Inject(() => Service) service: Service) {
      expect(service).toBeInstanceOf(Service)
    }

    @Action(Context)
    public act() {}
  }

  const app = await new Application().register(TestController).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('access injectable instance in controller constructor by reflect-metadata', async () => {
  await import('reflect-metadata')

  @Injectable
  class Service {}

  @Controller
  class TestController {
    constructor(service: Service) {
      expect(service).toBeInstanceOf(Service)
    }

    @Action(Context)
    public act() {}
  }

  Reflect.defineMetadata('design:paramtypes', [Service], TestController)

  const app = await new Application().register(TestController).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('nested inject', async () => {
  @Injectable
  class Service1 {}

  @Injectable
  class Service2 {
    constructor(@Inject(() => Service1) public readonly service: Service1) {}
  }

  @Controller
  class TestController {
    constructor(@Inject(() => Service2) public readonly service: Service2) {
      expect(service).toBeInstanceOf(Service2)
      expect(service.service).toBeInstanceOf(Service1)
    }

    @Action(Context)
    public act() {}
  }

  const app = await new Application().register(TestController).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('share inject in two services', async () => {
  @Injectable
  class SharedService {}

  @Injectable
  class Service1 {
    constructor(
      @Inject(() => SharedService) public readonly service: SharedService,
    ) {}
  }

  @Injectable
  class Service2 {
    constructor(
      @Inject(() => SharedService) public readonly service: SharedService,
    ) {}
  }

  @Controller
  class TestController {
    constructor(
      @Inject(() => Service1) public readonly service1: Service1,
      @Inject(() => Service2) public readonly service2: Service2,
    ) {
      expect(service1.service).toBeInstanceOf(SharedService)
      expect(service2.service).toBeInstanceOf(SharedService)
      expect(service1.service).toBe(service2.service)
    }

    @Action(Context)
    public act() {}
  }

  const app = await new Application().register(TestController).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})
