import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import {
  AnyMiddleware,
  FunctionMiddleware,
  Middleware,
} from '../models/Middleware.js'
import { Class } from '../typings/Class.js'

export function UseMiddleware<TContext extends Context>(
  context: Class<TContext> | Class<TContext>[],
  run: FunctionMiddleware<TContext>,
): (target: Class | object, propertyKey?: string | symbol) => void
export function UseMiddleware<TContext extends Context>(
  run: FunctionMiddleware<TContext>,
): (target: Class | object, propertyKey?: string | symbol) => void
export function UseMiddleware<TContext extends Context>(
  contextOrAnyMiddleware:
    | Class<TContext>
    | Class<TContext>[]
    | AnyMiddleware<TContext>,
  maybeFunctionMiddleware?: FunctionMiddleware<TContext>,
): (target: Class | object, propertyKey?: string | symbol) => void
export function UseMiddleware<TContext extends Context>(
  contextOrAnyMiddleware:
    | Class<TContext>
    | Class<TContext>[]
    | AnyMiddleware<TContext>,
  maybeFunctionMiddleware?: FunctionMiddleware<TContext>,
) {
  return (target: Class | object, propertyKey?: string | symbol) => {
    getMetadataArgsStorage().middlewares.unshift({
      type: 'middleware',
      target,
      propertyKey,
      middleware: Middleware.from(
        contextOrAnyMiddleware,
        maybeFunctionMiddleware,
      ),
    })
  }
}
