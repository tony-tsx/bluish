import { Action } from './decorators/Action.js'
import { Controller } from './decorators/Controller.js'
import { Inject } from './decorators/Inject.js'
import { Next } from './decorators/Next.js'
import { Input } from './decorators/Input.js'
import { Application } from './models/Application.js'
import { Context } from './models/Context.js'
import {
  BLUISH_METADATA_ARGS_STORAGE,
  getMetadataArgsStorage,
  MetadataArgsStorage,
} from './models/MetadataArgsStorage.js'
import { AnyMiddleware, Middleware } from './models/Middleware.js'
import { Class, Constructable } from './typings/Class.js'
import { MiddlewareCompose } from './models/MiddlewareCompose.js'

namespace BluishCoreTesting {
  let defaultApplication: Application = new Application()

  export class BluishCoreTestingContext extends Context {}

  export function resetMetadataArgsStorage(hard = false) {
    const _global = globalThis as any

    const args = getMetadataArgsStorage()

    delete _global[BLUISH_METADATA_ARGS_STORAGE]

    _global[BLUISH_METADATA_ARGS_STORAGE] = new MetadataArgsStorage()

    if (hard) return

    _global[BLUISH_METADATA_ARGS_STORAGE].injectables = args.injectables
    _global[BLUISH_METADATA_ARGS_STORAGE].injectableHoistings =
      args.injectableHoistings
  }

  export function setApplication(application: Application) {
    defaultApplication = application
  }

  function _args<TArgs extends any[]>(args: TArgs): [Application, ...TArgs] {
    if (typeof args[0] === 'object' && args[0] instanceof Application)
      return args as unknown as [Application, ...TArgs]

    return [defaultApplication, ...args]
  }

  function _normalize<TArgs extends any[], TReturn>(
    fn: (application: Application, ...args: TArgs) => TReturn,
    ...args: TArgs
  ): TReturn {
    // eslint-disable-next-line prefer-spread
    return fn.apply(undefined, _args(args))
  }

  export const runMiddleware = _normalize.bind(
    null,
    (
      application: Application,
      _middleware: AnyMiddleware | AnyMiddleware[],
      context: Context = new BluishCoreTestingContext(),
      next?: Next,
    ) => {
      const middleware = Array.isArray(_middleware)
        ? new MiddlewareCompose(_middleware)
        : Middleware.from(_middleware)

      return application.middlewares.run(
        context,
        async () => await middleware.run(context, async () => next?.()),
      )
    },
  ) as {
    (
      middleware: AnyMiddleware | AnyMiddleware[],
      context?: Context,
      next?: Next,
    ): Promise<unknown>
    (
      application: Application,
      middleware: AnyMiddleware | AnyMiddleware[],
      context?: Context,
      next?: Next,
    ): Promise<unknown>
  }

  export const runInject = _normalize.bind(
    null,
    async (
      application,
      decorator: ReturnType<typeof Inject>,
      context: Context = new BluishCoreTestingContext(),
    ) => {
      let value = undefined

      @Controller
      class ControllerForTest {
        @Action(context.constructor as Class<Context>)
        public static actionForTest(@decorator arg: unknown) {
          value = arg
        }
      }

      await run(application, ControllerForTest, 'actionForTest', context)

      return value
    },
  ) as {
    <T>(decorator: ReturnType<typeof Inject>, context?: Context): Promise<T>
    <T>(
      application: Application,
      decorator: ReturnType<typeof Inject>,
      context?: Context,
    ): Promise<T>
  }

  export const runSelector = _normalize.bind(
    null,
    async (
      application: Application,
      decorator: ReturnType<typeof Input>,
      context: Context = new BluishCoreTestingContext(),
    ): Promise<unknown> => {
      let value = undefined

      @Controller
      class ControllerForTest {
        @Action(context.constructor as Class<Context>)
        public static actionForTest(@decorator arg: unknown) {
          value = arg
        }
      }

      await run(application, ControllerForTest, 'actionForTest', context)

      return value
    },
  )

  export const run = _normalize.bind(
    null,
    async function run(
      application: Application,
      target: Constructable | object,
      propertyKey: symbol | string,
      context: Context = new BluishCoreTestingContext(),
    ): Promise<Context> {
      const constructable = (
        typeof target === 'function' ? target : target.constructor
      ) as Constructable

      await application.useController(constructable).bootstrap()

      const controller =
        application.controllers.findByConstructable(constructable)!

      const action =
        typeof target === 'function'
          ? controller.actions.findByStaticPropertyKey(propertyKey)
          : controller.actions.findByInstancePropertyKey(propertyKey)

      await action!.run(context)

      return context
    },
  ) as {
    <
      TTarget extends Constructable | object,
      TPropertyKey extends keyof TTarget,
      TContext extends Context = BluishCoreTestingContext,
    >(
      application: Application,
      target: TTarget,
      propertyKey: TPropertyKey,
      context?: TContext,
    ): Promise<Context>
    <
      TTarget extends Constructable | object,
      TPropertyKey extends keyof TTarget,
      TContext extends Context = BluishCoreTestingContext,
    >(
      target: TTarget,
      propertyKey: TPropertyKey,
      context?: TContext,
    ): Promise<Context>
  }
}

export default BluishCoreTesting
