import { glob } from 'glob'

import { Controller } from '../decorators/Controller.js'
import { Action } from '../decorators/Action.js'
import { toRunner } from '../tools/toRunner.js'
import { Class, Construtable } from '../typings/Class.js'
import { Context } from './Context.js'
import { getMetadataArgsStorage } from './MetadataArgsStorage.js'
import { AnyMiddleware, FunctionMiddleware, Middleware } from './Middleware.js'
import { Runner } from './Runner.js'
import { Injectable } from '../decorators/Injectable.js'
import { InjectableReference } from '../typings/InjectableReference.js'
import { Pipe } from '../decorators/Pipe.js'
import { buildControllerMetadata } from '../builds/build-controller-metadata.js'
import { buildControllerInjection } from '../builds/build-controller-injections.js'
import { buildControllerMiddlewares } from '../builds/build-controller-middlewares.js'
import { buildControllerActions } from '../builds/build-controller-actions.js'
import { buildControllerStatic } from '../builds/build-controlller-static.js'
import { buildControllerActionMetadata } from '../builds/build-controller-action-metadata.js'
import { buildControllerActionMiddlewares } from '../builds/build-controller-action-middlewares.js'
import { buildControllerActionInjections } from '../builds/build-controller-action-injections.js'
import { buildControllerActionArguments } from '../builds/build-controller-action-arguments.js'
import { buildControllerActionArgumentMetadata } from '../builds/build-controller-action-argument-metadata.js'
import { buildControllerActionIsolated } from '../builds/build-controller-action-isolated.js'
import { buildControllerIsolated } from '../builds/build-controller-isolated.js'
import { buildControllerPipes } from '../builds/build-controller-pipes.js'
import { buildControllerActionPipes } from '../builds/build-controller-action-pipes.js'
import { Setup } from './Setup.js'

export interface ApplicationOptions {
  middlewares?: AnyMiddleware[]
  controllers?: Class[]
}

export class Application {
  private _registers: (string | Class)[] = []
  private _controllers: Controller[] | null = null
  private ___injectables: Injectable[] | null = null
  private _injectables: Map<Injectable, unknown> = new Map()
  private _virtual = class VirtualController {
    static _controller: Controller = {
      actions: [],
      heirs: [],
      pipes: [],
      application: null!,
      injections: {
        parameters: new Map(),
        properties: new Map(),
        static: new Map(),
      },
      isIsolated: false,
      inherit: null,
      metadata: {},
      middlewares: [],
      target: VirtualController,
    }
  }
  private _isInitialized: boolean = false
  private _setups?: Setup[] = []

  public middlewares: Middleware[] = []

  public pipes: Pipe[] = []

  public get injectables(): readonly Injectable[] {
    if (!this.___injectables) throw new Error('Bluish is not initialized')

    return this.___injectables
  }

  public get controllers(): readonly Controller[] {
    if (!this._controllers) throw new Error('Bluish is not initialized')

    return this._controllers
  }

  public get isInitialized() {
    return this._isInitialized
  }

  private _castInjectable(injectable: Injectable) {
    if (injectable.scope !== 'singleton')
      throw new Error('Injectable non singleton not supported in cast')

    if (!this._injectables.has(injectable)) {
      const args: unknown[] = []

      for (const [
        parameterIndex,
        injectableReference,
      ] of injectable.injects.parameters.entries()) {
        const injectable = this._findInjectable(injectableReference)

        if (!injectable) throw new Error('Injectable not found')

        if (injectable.scope !== 'singleton')
          throw new Error(
            'Injectable scope not supported in static injection. Only singleton is supported',
          )

        args[parameterIndex] = this._castInjectable(injectable)
      }

      const instance = new (injectable.target as Construtable<unknown>)(...args)

      this._injectables.set(injectable, instance)

      return instance
    }

    return this._injectables.get(injectable)
  }

  private _findInjectable(ref: InjectableReference) {
    if (typeof ref === 'function') {
      const target = ref()

      const injectable = this.injectables.find(
        injectable => target === injectable.target,
      )

      if (injectable) return injectable

      const injectables = this.injectables.filter(
        injectable =>
          injectable.target && target.prototype instanceof injectable.target,
      )

      if (injectables.length > 1) throw new Error('Ambiguous injectable found')

      return injectables[0]
    }

    return this.injectables.find(injectable => injectable.id === ref)
  }

  constructor({ middlewares = [], controllers = [] }: ApplicationOptions = {}) {
    this._virtual._controller.application = this

    for (const middleware of middlewares) this.use(middleware)

    for (const controller of controllers) this.register(controller)
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
    this.middlewares.push(Middleware.from(contextOrMiddleware, maybeMiddleware))

    return this
  }

  public setup(setup: Setup) {
    if (this._isInitialized)
      throw new Error(
        'Application is already initialized, adding setup is not allowed and would have no effect.',
      )

    this._setups!.push(setup)

    return this
  }

  public pipe(pipe: Pipe) {
    this.pipes.push(pipe)

    return this
  }

  public register(register: Class | Class[] | string | string[]) {
    if (Array.isArray(register)) this._registers.push(...register)
    else this._registers.push(register)

    return this
  }

  public virtual(action: (context: Context) => unknown): Runner
  public virtual<TContext extends Context>(
    context: Class<TContext>,
    action: (context: Context) => unknown,
  ): Runner
  public virtual<TContext extends Context>(
    contextOrAction: Class<TContext> | ((context: Context) => unknown),
    maybeAction?: (context: Context) => unknown,
  ) {
    const context = maybeAction ? (contextOrAction as Class<TContext>) : Context
    const handle = maybeAction
      ? maybeAction
      : (contextOrAction as (context: Context) => unknown)

    const propertyKey = Symbol()

    Object.defineProperty(this._virtual, propertyKey, {
      value: (context: TContext) => handle(context),
      configurable: false,
      writable: false,
      enumerable: false,
    })

    const action: Action = {
      context,
      target: this._virtual,
      controller: this._virtual._controller,
      isIsolated: false,
      middlewares: [],
      propertyKey,
      arguments: new Map(),
      pipes: [],
      metadata: {},
      injections: {
        parameters: new Map(),
      },
    }

    action.arguments.set(0, {
      target: action.target,
      action,
      parameterIndex: 0,
      propertyKey: action.propertyKey,
      metadata: {},
      selectors: [{ context, selector: context => context }],
      type: context,
    })

    this._virtual._controller.actions.push(action)

    return toRunner(action)
  }

  protected onInjectable(injectable: Injectable) {
    this.___injectables!.push(injectable)

    if (injectable.target)
      for (const inject of getMetadataArgsStorage().injects) {
        if (typeof inject.target === 'function') {
          if (inject.target !== injectable.target)
            if (!(inject.target instanceof injectable.target)) continue
        } else if (inject.target.constructor !== injectable.target)
          if (!(inject.target instanceof injectable.target)) continue

        if (inject.propertyKey) {
          if (inject.parameterIndex !== undefined) continue

          if (typeof inject.target === 'function') {
            injectable.injects.static.set(inject.propertyKey, inject.injectable)

            continue
          }

          injectable.injects.properties.set(
            inject.propertyKey,
            inject.injectable,
          )

          continue
        }

        if (inject.parameterIndex === undefined) continue

        injectable.injects.parameters.set(
          inject.parameterIndex,
          inject.injectable,
        )
      }

    for (const [
      propertyKey,
      injectableReference,
    ] of injectable.injects.static.entries()) {
      const injectable = this._findInjectable(injectableReference)

      if (!injectable) throw new Error('Injectable not found')

      if (injectable.scope !== 'singleton')
        throw new Error(
          'Injectable scope not supported in static injection. Only singleton is supported',
        )

      Object.defineProperty(injectable.target, propertyKey, {
        value: this._castInjectable(injectable),
        configurable: false,
        enumerable: true,
        writable: false,
      })
    }

    if (injectable.scope === 'singleton') this._castInjectable(injectable)

    return injectable
  }

  public async initialize() {
    this._isInitialized = true

    const targets = await Promise.all(
      this._registers.map(async register => {
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

    this._controllers = []
    this.___injectables = []

    const args = getMetadataArgsStorage()

    args.injectables.forEach(injectable => {
      this.onInjectable({
        id: injectable.id,
        target: injectable.target,
        scope: injectable.scope,
        resolve: injectable.resolve,
        injects: {
          static: new Map(),
          parameters: new Map(),
          properties: new Map(),
        },
      })
    })

    args.controllers
      .filter(controller => targets.includes(controller.target))
      .map(args => {
        const controller: Controller = {
          target: args.target,
          isIsolated: args.isIsolated,
          actions: [],
          middlewares: [],
          heirs: [],
          application: this,
          metadata: {},
          pipes: [],
          injections: {
            static: new Map(),
            parameters: new Map(),
            properties: new Map(),
          },
          inherit: null,
        }

        this._controllers!.push(controller)

        buildControllerInjection(controller)

        buildControllerMetadata(controller)

        buildControllerMiddlewares(controller)

        buildControllerIsolated(controller)

        buildControllerPipes(controller)

        buildControllerActions(controller, action => {
          buildControllerActionMetadata(action)

          buildControllerActionMiddlewares(action)

          buildControllerActionInjections(action)

          buildControllerActionArguments(action, argument => {
            buildControllerActionArgumentMetadata(argument)
          })

          buildControllerActionIsolated(action)

          buildControllerActionPipes(action)
        })

        buildControllerStatic(controller)

        return [controller, args] as const
      })
      .forEach(([controller, args]) => {
        if (!args.inherit) return

        const target = args.inherit()

        const inherit = this.controllers.find(
          controller => controller.target === target,
        )

        if (!inherit) throw new TypeError('Inherit controller not found')

        inherit.heirs.push(controller)

        controller.inherit = inherit
      })

    for (const controller of this._controllers) {
      for (const action of controller.actions) {
        for (const argument of action.arguments.values())
          for (const setup of this._setups!) setup.onArgument(argument)

        for (const setup of this._setups!) setup.onAction(action)
      }

      for (const setup of this._setups!) setup.onController(controller)
    }

    for (const setup of this._setups!) setup.onApplication(this)

    delete this._setups

    return this
  }
}
