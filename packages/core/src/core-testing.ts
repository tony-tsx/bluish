import {
  Application,
  Class,
  Argument,
  toRunner,
  Controller,
  Action,
} from './core.js'
import { Context } from './models/Context.js'
import { Middleware } from './models/Middleware.js'

namespace CoreTesting {
  export function runMiddleware<TContext extends Context>(
    middleware: Middleware<TContext>,
    context: TContext,
    next?: () => unknown,
  ) {
    return middleware.handle(context, async () => next?.())
  }

  export async function runSelector<TContext extends Context>(
    application: Application,
    selectorDecorator: ReturnType<typeof Argument>,
    context: TContext,
  ): Promise<unknown>
  export async function runSelector<TContext extends Context>(
    selectorDecorator: ReturnType<typeof Argument>,
    context: TContext,
  ): Promise<unknown>
  export async function runSelector<TContext extends Context>(
    applicationOrSelectorDecorator: Application | ReturnType<typeof Argument>,
    selectorDecoratorOrContext: ReturnType<typeof Argument> | TContext,
    maybeContext?: TContext,
  ): Promise<unknown> {
    const application = maybeContext
      ? (applicationOrSelectorDecorator as Application)
      : new Application()
    const selectorDecorator = (
      maybeContext ? selectorDecoratorOrContext : applicationOrSelectorDecorator
    ) as ReturnType<typeof Argument>
    const context = (maybeContext ?? selectorDecoratorOrContext) as TContext

    let value = undefined
    class ControllerForTest {
      public static actionForTest(arg: unknown) {
        value = arg
      }
    }

    Controller(ControllerForTest)
    Action(context.constructor as Class<Context>)(
      ControllerForTest,
      'actionForTest',
    )
    selectorDecorator(ControllerForTest, 'actionForTest', 0)

    await run(application, ControllerForTest, 'actionForTest', context)

    return value
  }

  export async function run<
    TTarget extends Class | object,
    TPropertyKey extends keyof TTarget,
    TContext extends Context,
  >(
    application: Application,
    target: TTarget,
    propertyKey: TPropertyKey,
    context: TContext,
  ): Promise<unknown>
  export async function run<
    TTarget extends Class | object,
    TPropertyKey extends keyof TTarget,
    TContext extends Context,
  >(
    target: TTarget,
    propertyKey: TPropertyKey,
    context: TContext,
  ): Promise<unknown>
  export async function run<
    TTarget extends Class | object,
    TPropertyKey extends keyof TTarget,
    TContext extends Context,
  >(
    applicationOrTarget: Application | TTarget,
    targetOrPropertyKey: TTarget | TPropertyKey,
    propertyKeyOrContext: TPropertyKey | TContext,
    maybeContext?: TContext,
  ) {
    const _application = maybeContext
      ? (applicationOrTarget as Application)
      : new Application()
    const target = (
      maybeContext ? targetOrPropertyKey : applicationOrTarget
    ) as TTarget

    const propertyKey = (
      maybeContext ? propertyKeyOrContext : targetOrPropertyKey
    ) as TPropertyKey

    const constructor = (
      typeof target === 'function' ? target : target.constructor
    ) as Class

    const application = new Application()

    application.middlewares = _application.middlewares

    await application.register(constructor).initialize()

    const controller = application.controllers.find(
      controller => controller.target === constructor,
    )

    const action = controller!.actions.find(action => {
      if (typeof action.target !== typeof target) return false

      return action.propertyKey === propertyKey
    })

    const context = maybeContext ?? (propertyKeyOrContext as TContext)

    return toRunner(action!).run(context)
  }
}

export default CoreTesting
