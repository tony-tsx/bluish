import { glob } from 'glob'

import { Class } from '../typings/Class.js'
import { Context } from './Context.js'
import { getMetadataArgsStorage } from './MetadataArgsStorage.js'
import { AnyMiddleware, FunctionMiddleware, Middleware } from './Middleware.js'
import { ApplicationSource } from './ApplicationSource.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { ApplicationControllerCollection } from './ApplicationSourceCollection.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { ApplicationSourceMiddlewareCollection } from './ApplicationSourceMiddlewareCollection.js'
import { Module } from './Module.js'
import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'
import { Pipe } from './Pipe.js'
import { PipeFunction } from '../decorators/UsePipe.js'
import { injectable } from '../pipes/injectable.js'
import { IUsable } from '../decorators/Use.js'

export interface ApplicationOptions {
  middlewares?: AnyMiddleware[]
  controllers?: (Class | string)[]
  pipes?: (Pipe | PipeFunction)[]
}

export class Application {
  #isInitialized: boolean = false

  #registers: (string | Class)[] = []

  #virtual: ApplicationSource

  public readonly metadata = new ApplicationSourceMetadata()

  public readonly controllers = new ApplicationControllerCollection(this)

  public readonly middlewares = new ApplicationSourceMiddlewareCollection(null)

  public readonly pipes = new ApplicationSourcePipeCollection(null)

  public get isInitialized() {
    return this.#isInitialized
  }

  constructor({
    middlewares = [],
    controllers = [],
    pipes = [],
  }: ApplicationOptions = {}) {
    this.usePipe(injectable)

    for (const middleware of middlewares) this.useMiddleware(middleware)

    for (const controller of controllers) this.useController(controller)

    for (const pipe of pipes) this.usePipe(pipe)

    this.#virtual = new ApplicationSource(this, {
      type: 'controller',
      target: class VirtualController {},
    })
  }

  public use(usable: IUsable) {
    usable.use(this)

    return this
  }

  public useMiddleware<TContext extends Context>(
    context: Class<TContext> | Class<TContext>[],
    run: FunctionMiddleware<TContext>,
  ): this
  public useMiddleware<TContext extends Context>(
    run: FunctionMiddleware<TContext>,
  ): this
  public useMiddleware<TContext extends Context>(
    contextOrAnyMiddleware:
      | Class<TContext>
      | Class<TContext>[]
      | AnyMiddleware<TContext>,
    maybeFunctionMiddleware?: FunctionMiddleware<TContext>,
  ): this
  public useMiddleware(
    contextOrAnyMiddleware:
      | Class<Context>
      | Class<Context>[]
      | AnyMiddleware<Context>,
    maybeFunctionMiddleware?: FunctionMiddleware<Context>,
  ): this {
    this.middlewares.add(
      Middleware.from(contextOrAnyMiddleware, maybeFunctionMiddleware),
    )

    return this
  }

  public usePipe(pipe: Pipe | PipeFunction) {
    if (typeof pipe === 'function') this.pipes.add(new Pipe(pipe))
    else this.pipes.add(pipe)

    return this
  }

  public useController(register: Class | string) {
    this.#registers.push(register)

    return this
  }

  public useAction(
    virtualizer: (context: Context) => unknown,
    refs?: unknown[],
  ): ApplicationSourceAction
  public useAction<TContext extends Context>(
    context: Class<TContext>,
    virtualizer: (context: TContext) => unknown,
    refs?: unknown[],
  ): ApplicationSourceAction
  public useAction<TContext extends Context>(
    contextOrHandle: Class<TContext> | ((context: Context) => unknown),
    maybeRefsOrVirtualizer?: unknown[] | ((context: Context) => unknown),
    maybeRefs?: unknown[],
  ) {
    const context =
      typeof maybeRefsOrVirtualizer === 'function'
        ? (contextOrHandle as Class<Context>)
        : Context
    const handle =
      typeof maybeRefsOrVirtualizer === 'function'
        ? maybeRefsOrVirtualizer
        : (contextOrHandle as (context: Context) => unknown)
    const refs = Array.isArray(maybeRefsOrVirtualizer)
      ? maybeRefsOrVirtualizer
      : (maybeRefs ?? [])

    const action = new ApplicationSourceAction(this.#virtual, {
      type: 'action',
      context,
      target: this.#virtual.target,
      virtualizer: { handle, refs },
    })

    this.#virtual.actions.add(action)

    return action
  }

  public async bootstrap() {
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

        const controller = new ApplicationSource(this, _controller)

        await controller.static.call(controller.target, module)

        this.controllers!.add(controller)
      }),
    )

    if (!this.#virtual) return this

    this.controllers.add(this.#virtual)

    return this
  }
}
