import { expect, it, vi } from 'vitest'
import { Injectable } from '../../decorators/Injectable.js'
import { Controller } from '../../decorators/Controller.js'
import { Inject } from '../../decorators/Inject.js'
import { Action } from '../../decorators/Action.js'
import { Application } from '../Application.js'
import { Context } from '../Context.js'
import { InjectableHoisting } from '../../decorators/InjectableHoisting.js'
import { Constructable } from '../../typings/Class.js'

it('resolve injectable', async () => {
  @Injectable
  class Service {}

  @Controller
  class Root {
    @Action
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static action(@Inject(() => Service) service: Service) {}
  }

  vi.spyOn(Root, 'action')

  const application = await new Application().useController(Root).bootstrap()

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!
    .run(new Context())

  expect(Root.action).toHaveBeenCalledWith(expect.any(Service))
})

it('resolve injectable hoisting', async () => {
  @Injectable
  class Service {
    @InjectableHoisting
    public hoisting = 'hoisting'
  }

  @Controller
  class Root {
    @Action
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static action(@Inject(() => Service) service: string) {}
  }

  vi.spyOn(Root, 'action')

  const application = await new Application().useController(Root).bootstrap()

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!
    .run(new Context())

  expect(Root.action).toHaveBeenCalledWith('hoisting')
})

it('use injectable hoisting to create custom injectable', async () => {
  class Repository<T> {
    constructor(public readonly entity: Constructable<T>) {}
  }

  abstract class _InjectRepository {
    public abstract getEntity(): Constructable

    @InjectableHoisting
    public repository: Repository<unknown>

    constructor() {
      this.repository = new Repository(this.getEntity())
    }
  }

  function InjectRepository(getEntity: () => Constructable) {
    class Repository extends _InjectRepository {
      public getEntity(): Constructable {
        return getEntity()
      }
    }

    Injectable('transient')(Repository)

    return Inject(() => Repository)
  }

  class User {}

  @Controller
  class Root {
    @Action
    public static action(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      @InjectRepository(() => User) userRepository: Repository<User>,
    ) {}
  }

  vi.spyOn(Root, 'action')

  const application = await new Application().useController(Root).bootstrap()

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!
    .run(new Context())

  expect(Root.action).toHaveBeenCalledWith(expect.any(Repository))
  expect(Root.action).toHaveBeenCalledWith(
    expect.objectContaining({
      entity: User,
    }),
  )
})

it('', async () => {
  @Controller
  class Root {
    @Action
    public static action(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      @Inject(() => Context) context: Context,
    ) {}
  }

  vi.spyOn(Root, 'action')

  const application = await new Application().useController(Root).bootstrap()

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!
    .run(new Context())

  expect(Root.action).toHaveBeenCalledWith(expect.any(Context))
})

it('', async () => {
  Injectable.register('t', 'context', c => c, Context)

  @Controller
  class Root {
    @Action
    public static action(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      @Inject('t') context: Context,
    ) {}
  }

  vi.spyOn(Root, 'action')

  const application = await new Application().useController(Root).bootstrap()

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!
    .run(new Context())

  expect(Root.action).toHaveBeenCalledWith(expect.any(Context))
})
