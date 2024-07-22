/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, it } from 'vitest'
import { Injectable } from '../Injectable.js'
import { Application } from '../../models/Application.js'
import { Controller } from '../Controller.js'
import { Inject } from '../Inject.js'
import { Action } from '../Action.js'
import { Context } from '../../models/Context.js'
import { toRunner } from '../../tools/toRunner.js'

it('adds singleton injectable in app', async () => {
  @Injectable({ scope: 'singleton' })
  class Service {}

  const app = await new Application().initialize()

  expect(app.injectables).toHaveLength(1)
  expect(app.injectables[0].scope).toBe('singleton')
})

it('use transient injectable', async () => {
  @Injectable({ scope: 'transient' })
  class Service {}

  @Controller
  class Test {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {
      expect(this.service).toBeInstanceOf(Service)
    }
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('share two request injectable in same controller', async () => {
  @Injectable({ scope: 'request' })
  class Service {}

  @Controller
  class Test {
    @Inject(() => Service)
    public readonly service1!: Service

    @Inject(() => Service)
    public readonly service2!: Service

    @Action(Context)
    public act() {
      expect(this.service1).toBeInstanceOf(Service)
      expect(this.service2).toBeInstanceOf(Service)
      expect(this.service1).toBe(this.service2)
    }
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('share two singleton injectable in same controller', async () => {
  @Injectable({ scope: 'singleton' })
  class Service {}

  @Controller
  class Test {
    @Inject(() => Service)
    public readonly service1!: Service

    @Inject(() => Service)
    public readonly service2!: Service

    @Action(Context)
    public act() {
      expect(this.service1).toBeInstanceOf(Service)
      expect(this.service2).toBeInstanceOf(Service)
      expect(this.service1).toBe(this.service2)
    }
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})

it('share two singletion injectable in different controller', async () => {
  @Injectable({ scope: 'singleton' })
  class Service {}

  @Controller
  class Test1 {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {
      expect(this.service).toBeInstanceOf(Service)

      return this.service
    }
  }

  @Controller
  class Test2 {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {
      expect(this.service).toBeInstanceOf(Service)

      return this.service
    }
  }

  const app = await new Application()
    .register(Test1)
    .register(Test2)
    .initialize()

  const service1 = await toRunner(app.controllers[0].actions[0]).run(
    new Context(),
  )

  expect(service1).toBeInstanceOf(Service)

  const service2 = await toRunner(app.controllers[1].actions[0]).run(
    new Context(),
  )

  expect(service2).toBeInstanceOf(Service)

  expect(service1).toBe(service2)
})

it('dont share two request injectable in different controller', async () => {
  @Injectable({ scope: 'request' })
  class Service {}

  @Controller
  class Test1 {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {
      expect(this.service).toBeInstanceOf(Service)

      return this.service
    }
  }

  @Controller
  class Test2 {
    @Inject(() => Service)
    public readonly service!: Service

    @Action(Context)
    public act() {
      expect(this.service).toBeInstanceOf(Service)

      return this.service
    }
  }

  const app = await new Application()
    .register(Test1)
    .register(Test2)
    .initialize()

  const service1 = await toRunner(app.controllers[0].actions[0]).run(
    new Context(),
  )

  expect(service1).toBeInstanceOf(Service)

  const service2 = await toRunner(app.controllers[1].actions[0]).run(
    new Context(),
  )

  expect(service2).toBeInstanceOf(Service)

  expect(service1).not.toBe(service2)
})

it('cast two transient injectable in same controller', async () => {
  @Injectable({ scope: 'transient' })
  class Service {}

  @Controller
  class Test {
    @Inject(() => Service)
    public readonly service1!: Service

    @Inject(() => Service)
    public readonly service2!: Service

    @Action(Context)
    public act() {
      expect(this.service1).toBeInstanceOf(Service)
      expect(this.service2).toBeInstanceOf(Service)
      expect(this.service1).not.toBe(this.service2)
    }
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())
})
