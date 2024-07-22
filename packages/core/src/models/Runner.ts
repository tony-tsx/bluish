import { Constructable } from 'vitest'
import { Action } from '../decorators/Action.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'
import { Middleware } from './Middleware.js'
import { compose } from '../tools/compose.js'
import { Controller } from '../core.js'

export class Runner {
  readonly #middlewares: (context: Context, next: Next) => Promise<unknown>
  readonly #fn: (context: Context) => unknown

  constructor(public readonly action: Action) {
    const middlewares = (() => {
      if (action.isIsolated)
        return [...Middleware.middlewares, ...this.action.middlewares]

      const middlewares = Controller.each(
        action.controller,
        controller => controller.middlewares,
      )
        .reverse()
        .flat(1)

      if (action.controller.isIsolated)
        return [
          ...Middleware.middlewares,
          ...middlewares,
          ...action.middlewares,
        ]

      return [
        ...Middleware.middlewares,
        ...action.controller.application.middlewares,
        ...middlewares,
        ...action.middlewares,
      ]
    })()

    this.#middlewares = compose(middlewares)

    this.#fn = async context => {
      const args: unknown[] = []

      for (const [index, selectors] of this.action.selectors.entries()) {
        const argument = selectors.find(selector => {
          return context instanceof selector.context
        })

        if (!argument) continue

        args[index] = await argument.selector(context)
      }

      for (const [
        parameterIndex,
        injectable,
      ] of this.action.injections.parameters.entries())
        args[parameterIndex] = context.module.resolve(injectable)

      if (typeof this.action.target === 'object') {
        const contructorArgs: unknown[] = []

        for (const [
          parameterIndex,
          injectable,
        ] of this.action.controller.injections.parameters.entries())
          contructorArgs[parameterIndex] = context.module.resolve(injectable)

        const controller = new (this.action.controller.target as Constructable)(
          ...contructorArgs,
        )

        Object.defineProperty(context, 'target', {
          value: controller,
          writable: false,
          enumerable: false,
          configurable: false,
        })

        for (const [
          propertyKey,
          injectable,
        ] of this.action.controller.injections.properties.entries())
          controller[propertyKey] = context.module.resolve(injectable)

        // @ts-expect-error: TODO
        return (context.return = await controller[this.action.propertyKey](
          ...args,
        ))
      }

      Object.defineProperty(context, 'target', {
        value: this.action.controller.target,
        writable: false,
        enumerable: false,
        configurable: false,
      })

      // @ts-expect-error: TODO
      return (context.return = await this.action.controller.target[
        this.action.propertyKey
      ](...args))
    }
  }

  public run(context: Context) {
    if (!(context instanceof this.action.context))
      throw new TypeError('Invalid context')

    Object.defineProperty(context, 'runner', {
      value: this,
      writable: false,
      enumerable: false,
      configurable: false,
    })

    return this.#middlewares(context, () => this.#fn(context))
  }
}
