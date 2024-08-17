import { glob } from 'glob'

import { Class } from '../typings/Class.js'
import { Context } from './Context.js'
import { getMetadataArgsStorage } from './MetadataArgsStorage.js'
import { AnyMiddleware, FunctionMiddleware, Middleware } from './Middleware.js'
import { Pipe } from '../decorators/Pipe.js'
import { ApplicationController } from './ApplicationController.js'
import { ApplicationControllerAction } from './ApplicationControllerAction.js'
import { ApplicationControllerCollection } from './ApplicationControllerCollection.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { ApplicationSourceMiddlewareCollection } from './ApplicationSourceMiddlewareCollection.js'
import { injectable } from '../pipes/injectable.js'
import { Module } from './Module.js'

export interface ApplicationOptions {
  middlewares?: AnyMiddleware[]
  controllers?: (Class | string)[]
}

export class Application {
  #isInitialized: boolean = false

  #registers: (string | Class)[] = []

  #virtual: ApplicationController | null = null

  public readonly controllers = new ApplicationControllerCollection(this)

  public readonly middlewares = new ApplicationSourceMiddlewareCollection(null)

  public readonly pipes = new ApplicationSourcePipeCollection(null)

  public get isInitialized() {
    return this.#isInitialized
  }

  constructor({ middlewares = [], controllers = [] }: ApplicationOptions = {}) {
    for (const middleware of middlewares) this.use(middleware)

    for (const controller of controllers) this.controller(controller)

    this.pipe(injectable)
  }

  public use(middleware: AnyMiddleware): this
  public use<TContext extends Context>(
    context: Class<TContext>,
    middleware: FunctionMiddleware<TContext>,
  ): this
  public use<TContext extends Context>(
    contextOrMiddleware: Class<TContext> | Class<TContext>[] | AnyMiddleware,
    maybeMiddleware?: FunctionMiddleware<TContext>,
  ): this {
    this.middlewares.add(Middleware.from(contextOrMiddleware, maybeMiddleware))

    return this
  }

  public pipe(pipe: Pipe) {
    this.pipes.add(pipe)

    return this
  }

  public controller(register: Class | string) {
    this.#registers.push(register)

    return this
  }

  public action(
    virtualizer: (context: Context) => unknown,
  ): ApplicationControllerAction
  public action<TContext extends Context>(
    context: Class<TContext>,
    virtualizer: (context: Context) => unknown,
  ): ApplicationControllerAction
  public action<TContext extends Context>(
    contextOrAction: Class<TContext> | ((context: Context) => unknown),
    maybeVirtualizer?: (context: Context) => unknown,
  ) {
    const context = maybeVirtualizer
      ? (contextOrAction as Class<Context>)
      : Context
    const virtualizer = maybeVirtualizer
      ? maybeVirtualizer
      : (contextOrAction as (context: Context) => unknown)

    if (!this.#virtual)
      this.#virtual = new ApplicationController(this, {
        target: class VirtualController {},
      })

    const action = new ApplicationControllerAction(this.#virtual, {
      context,
      target: this.#virtual.target,
      virtualizer,
    })

    this.#virtual.actions.add(action)

    return action
  }

  public async initialize() {
    this.#isInitialized = true

    const targets = await Promise.all(
      this.#registers.map(async register => {
        if (typeof register === 'function') return register

        const pathfiles = await glob(register)

        const values = await Promise.all(
          pathfiles.map(async pathfile => {
            const module = await import(pathfile)

            return Object.values(module).filter(
              (value): value is Class => typeof value === 'function',
            )
          }),
        )

        return values.flat(1)
      }),
    ).then(targets => targets.flat(1))

    const module = new Module(this)

    await Promise.all(
      getMetadataArgsStorage().controllers.map(async _controller => {
        if (!targets.includes(_controller.target)) return

        const controller = new ApplicationController(this, _controller)

        const properties = await controller.static.toProperties(module)

        for (const propertyKey of [
          ...Object.getOwnPropertySymbols(properties),
          ...Object.getOwnPropertyNames(properties),
        ])
          Object.defineProperty(controller.target, propertyKey, {
            value: properties[propertyKey],
            configurable: false,
            writable: false,
            enumerable: true,
          })

        this.controllers!.add(controller)
      }),
    )

    if (!this.#virtual) return this

    this.controllers.add(this.#virtual)

    return this
  }
}
