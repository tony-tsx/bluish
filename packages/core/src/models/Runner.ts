import { Constructable } from 'vitest'
import { Action } from '../decorators/Action.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'
import { compose } from '../tools/compose.js'
import { Controller } from '../core.js'
import { Argument } from '../decorators/Argument.js'
import { Pipe } from '../decorators/Pipe.js'
import { toMiddlewares } from '../tools/toMiddlewares.js'

export class Runner {
  readonly #middlewares: (context: Context, next: Next) => Promise<unknown>
  readonly #action: (context: Context) => unknown
  readonly #pipe: (
    value: unknown,
    argument: Argument,
    context: Context,
  ) => unknown
  readonly #arguments = async (context: Context) => {
    const args: unknown[] = []

    await Promise.all(
      Array.from(context.runner.action.arguments.entries()).map(
        async ([parameterIndex, argument]) => {
          const selector = argument.selectors.find(selector => {
            return context instanceof selector.context
          })

          if (!selector) return

          args[parameterIndex] = await this.#pipe(
            await selector.selector(context),
            argument,
            context,
          )
        },
      ),
    )

    for (const [
      parameterIndex,
      injectable,
    ] of context.runner.action.injections.parameters.entries())
      args[parameterIndex] = context.module.resolve(injectable)

    return args
  }

  constructor(public readonly action: Action) {
    this.#middlewares = compose(toMiddlewares(action))

    this.#pipe = (() => {
      const pipes: Pipe[] = (() => {
        if (action.isIsolated) return action.pipes.slice()

        const pipes = Controller.each(
          action.controller,
          controller => controller.pipes,
        )
          .reverse()
          .flat(1)

        if (action.controller.isIsolated) return [...pipes, ...action.pipes]

        return [
          ...action.controller.application.pipes,
          ...pipes,
          ...action.pipes,
        ]
      })()

      return async (value: unknown, argument: Argument, context: Context) => {
        for (const pipe of pipes) value = await pipe(value, argument, context)

        return value
      }
    })()

    this.#action = async context => {
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

        const args = await this.#arguments(context)

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

      const args = await this.#arguments(context)

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

    return this.#middlewares(context, async () => this.#action(context))
  }
}
