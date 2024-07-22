import { glob } from 'glob'

import { Controller } from '../decorators/Controller.js'
import { Action } from '../decorators/Action.js'
import { toRunner } from '../tools/toRunner.js'
import { Class, Construtable } from '../typings/Class.js'
import { Context } from './Context.js'
import { getMetadataArgsStorage } from './MetadataArgsStorage.js'
import { AnyMiddleware, FunctionMiddleware, Middleware } from './Middleware.js'
import { Runner } from './Runner.js'
import { isSameController } from '../tools/isSameController.js'
import { isSameAction } from '../tools/isSameAction.js'
import { Injectable } from '../decorators/Injectable.js'
import { InjectableReference } from '../typings/InjectableReference.js'

export class Application {
  private _registers: (string | Class)[] = []
  private _controllers: Controller[] | null = null
  private ___injectables: Injectable[] | null = null
  private _injectables: Map<Injectable, unknown> = new Map()
  private _virtual = class VirtualController {
    static _controller: Controller = {
      actions: [],
      heirs: [],
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

  public middlewares: Middleware[] = []

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

  constructor() {
    this._virtual._controller.application = this
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
      selectors: [],
      metadata: {},
      injections: {
        parameters: new Map(),
      },
    }

    action.selectors.push([
      {
        target: action.target,
        context,
        action,
        parameterIndex: 0,
        propertyKey: action.propertyKey,
        selector: context => context,
      },
    ])

    this._virtual._controller.actions.push(action)

    return toRunner(action)
  }

  protected onController(controller: Controller) {
    this._controllers!.push(controller)

    const args = getMetadataArgsStorage()

    if (
      'getMetadata' in Reflect &&
      typeof (Reflect as any).getMetadata === 'function'
    ) {
      const designParamTypes = (Reflect as any).getMetadata(
        'design:paramtypes',
        controller.target,
      )

      if (Array.isArray(designParamTypes))
        designParamTypes.forEach((target, parameterIndex) => {
          if (!target) return

          controller.injections.parameters.set(parameterIndex, () => target)
        })
    }

    for (const inject of args.injects) {
      if (!isSameController(controller, inject.target)) continue

      if (inject.propertyKey) {
        if (inject.parameterIndex !== undefined) continue

        if (typeof inject.target === 'function') {
          controller.injections.static.set(
            inject.propertyKey,
            inject.injectable,
          )

          continue
        }

        controller.injections.properties.set(
          inject.propertyKey,
          inject.injectable,
        )

        continue
      }

      if (inject.parameterIndex === undefined) continue

      controller.injections.parameters.set(
        inject.parameterIndex,
        inject.injectable,
      )
    }

    for (const metadata of args.metadatas) {
      if (!isSameController(controller, metadata.target)) continue

      if (metadata.propertyKey) continue

      Object.assign(controller.metadata, {
        [metadata.key]:
          typeof controller.metadata[metadata.key] !== 'undefined'
            ? metadata.reducer(
                metadata.value,
                controller.metadata[metadata.key],
              )
            : metadata.value,
      })
    }

    for (const middleware of args.middlewares) {
      if (!isSameController(controller, middleware.target)) continue

      if (middleware.propertyKey !== undefined) continue

      controller.middlewares.push(middleware.middleware)
    }

    for (const isolated of args.isolated) {
      if (isolated.propertyKey) continue

      if (!isSameController(controller, isolated.target)) continue

      controller.isIsolated = true
    }

    for (const action of args.actions) {
      if (!isSameController(controller, action.target)) continue

      this.onAction({
        context: action.context,
        target: action.target,
        propertyKey: action.propertyKey,
        middlewares: action.middlewares ?? [],
        selectors: [],
        isIsolated: false,
        controller,
        metadata: {},
        injections: {
          parameters: new Map(),
        },
      })
    }

    for (const [
      propertyKey,
      injectableReference,
    ] of controller.injections.static.entries()) {
      const injectable = this._findInjectable(injectableReference)

      if (!injectable) throw new Error('Injectable not found')

      if (injectable.scope !== 'singleton')
        throw new Error(
          'Injectable non singleton not supported in static injection',
        )

      Object.defineProperty(controller.target, propertyKey, {
        value: this._castInjectable(injectable),
        configurable: false,
        enumerable: true,
        writable: false,
      })
    }

    return controller
  }

  protected onAction(action: Action) {
    action.controller.actions.push(action)

    const args = getMetadataArgsStorage()

    for (const metadata of args.metadatas) {
      if (!metadata.propertyKey) continue

      if (!isSameAction(action, metadata.target, metadata.propertyKey)) continue

      Object.assign(action.metadata, {
        [metadata.key]:
          typeof action.metadata[metadata.key] !== 'undefined'
            ? metadata.reducer(metadata.value, action.metadata[metadata.key])
            : metadata.value,
      })
    }

    for (const middleware of args.middlewares) {
      if (!middleware.propertyKey) continue

      if (!isSameAction(action, middleware.target, middleware.propertyKey))
        continue

      action.middlewares.push(middleware.middleware)
    }

    for (const inject of args.injects) {
      if (!inject.propertyKey) continue

      if (inject.parameterIndex === undefined) continue

      if (!isSameAction(action, inject.target, inject.propertyKey)) continue

      action.injections.parameters.set(inject.parameterIndex, inject.injectable)
    }

    for (const selector of args.selectors) {
      if (!isSameAction(action, selector.target, selector.propertyKey)) continue

      action.selectors[selector.parameterIndex] ??= []

      action.selectors[selector.parameterIndex].push({
        context: selector.context,
        target: selector.target,
        propertyKey: selector.propertyKey,
        parameterIndex: selector.parameterIndex,
        action,
        selector: selector.selector,
      })
    }

    for (const isolated of args.isolated) {
      if (!isolated.propertyKey) continue

      if (!isSameAction(action, isolated.target, isolated.propertyKey)) continue

      action.isIsolated = true
    }

    return action
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
      .map(
        args =>
          [
            this.onController({
              target: args.target,
              isIsolated: args.isIsolated,
              actions: [],
              middlewares: [],
              heirs: [],
              application: this,
              metadata: {},
              injections: {
                static: new Map(),
                parameters: new Map(),
                properties: new Map(),
              },
              inherit: null,
            }),
            args,
          ] as const,
      )
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

    return this
  }
}
