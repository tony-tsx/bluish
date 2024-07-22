import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import {
  AnyMiddleware,
  FunctionMiddleware,
  Middleware,
} from '../models/Middleware.js'
import { Class } from '../typings/Class.js'

export function Use(
  middleware: AnyMiddleware,
): (target: Class | object, propertyKey?: string | symbol) => void
export function Use<TContext extends Context>(
  context: Class<TContext>,
  middleware: FunctionMiddleware<TContext>,
): (target: Class | object, propertyKey?: string | symbol) => void
export function Use<TContext extends Context>(
  contextOrMiddleware: Class<TContext> | AnyMiddleware,
  maybeHandle?: FunctionMiddleware<TContext>,
) {
  return (target: Class | object, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().middlewares.push({
      target,
      propertyKey,
      middleware: Middleware.from(contextOrMiddleware, maybeHandle),
    })
  }
}
