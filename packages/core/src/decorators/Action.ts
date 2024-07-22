import { Class } from '../typings/Class.js'
import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { AnyMiddleware, Middleware } from '../models/Middleware.js'
import { Selector } from './Selector.js'
import { Controller } from './Controller.js'
import { InjectableReference } from '../typings/InjectableReference.js'

export function Action<
  TContext extends Context,
  TType extends keyof Bluish.Action.Types = keyof Bluish.Action.Types,
>(
  context: Class<TContext>,
  {
    middlewares: middlewareOrMiddlewares,
    ...configuration
  }: (Bluish.Action.Types[TType] extends never
    ? {}
    : Bluish.Action.Types[TType]) & {
    middlewares?: AnyMiddleware<TContext> | AnyMiddleware<TContext>[]
  } = {} as any,
) {
  const middlewares = Array.isArray(middlewareOrMiddlewares)
    ? middlewareOrMiddlewares
    : middlewareOrMiddlewares
      ? [middlewareOrMiddlewares]
      : []

  return (target: Class | object, propertyKey: symbol | string) => {
    getMetadataArgsStorage().actions.push({
      context,
      target,
      propertyKey,
      middlewares: middlewares.map(middleware => {
        if (typeof middleware === 'function')
          return Middleware.from(context, middleware)

        return middleware
      }),
      configuration,
    })
  }
}

export interface Action {
  context: Class<Context>
  target: Class | object
  propertyKey: string | symbol
  middlewares: Middleware[]
  selectors: Selector[][]
  isIsolated: boolean
  controller: Controller
  metadata: Partial<Bluish.Action.Metadata>
  injections: {
    parameters: Map<number, InjectableReference>
  }
}
