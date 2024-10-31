import { Context } from '../models/Context.js'
import { Class, Constructable } from '../typings/Class.js'
import { UseMiddleware } from '../decorators/UseMiddleware.js'
import { Metadata } from '../decorators/Metadata.js'
import { CatchMiddleware } from '../middlewares/CatchMiddleware.js'

export type CatchHandler<TContext extends Context = Context> = (
  error: Error,
  context: TContext,
) => unknown

export function Catch<TContext extends Context>(
  context: Class<TContext> | Class<TContext>[],
  run: CatchHandler<TContext>,
): (
  target: Class | object,
  propertyKey?: string | symbol,
  propertyDescriptor?: PropertyDescriptor,
) => void
export function Catch<TContext extends Context>(
  run: CatchHandler<TContext>,
): (
  target: Class | object,
  propertyKey?: string | symbol,
  propertyDescriptor?: PropertyDescriptor,
) => void
export function Catch<TContext extends Context>(
  contextOrAnyMiddleware:
    | Class<TContext>
    | Class<TContext>[]
    | CatchHandler<TContext>,
  maybeFunctionMiddleware?: CatchHandler<TContext>,
) {
  return UseMiddleware(
    new CatchMiddleware(contextOrAnyMiddleware, maybeFunctionMiddleware),
  )
}

export namespace Catch {
  export function Rewrite<TError extends Error>(
    from: Constructable<TError> | Constructable<TError>[],
    to: Constructable<Error, [message: string, options?: ErrorOptions]>,
    messageOrMessageFactory: string | ((error: TError) => string) = error =>
      error.message,
  ) {
    return function (
      target: object,
      propertyKey?: string | symbol,
      propertyDescriptor?: PropertyDescriptor,
    ) {
      const exceptions = Array.isArray(from) ? from : [from]

      exceptions.forEach(exception => {
        Metadata(
          'catch:rewrites',
          [{ from: exception, to }],
          (value, previous) => previous.concat(value),
        )(target, propertyKey, propertyDescriptor)

        return Catch(error => {
          if (!(error instanceof exception)) throw error

          const message =
            typeof messageOrMessageFactory === 'string'
              ? messageOrMessageFactory
              : messageOrMessageFactory(error)

          throw new to(message, { cause: error })
        })(target, propertyKey, propertyDescriptor)
      })
    }
  }
}
