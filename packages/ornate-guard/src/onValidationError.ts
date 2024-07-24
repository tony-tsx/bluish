import { Class, Context, Middleware, Next } from '@bluish/core'
import { ValidationError } from 'ornate-guard'

export type HandleValidationError<TContext extends Context> = (
  error: ValidationError,
  context: TContext,
  next: Next,
) => void

export function onValidationError(
  handle: HandleValidationError<Context>,
): Middleware
export function onValidationError<TContext extends Context>(
  context: Class<TContext>,
  handle: HandleValidationError<TContext>,
): Middleware<TContext>
export function onValidationError<TContext extends Context>(
  handleOrcontext: HandleValidationError<Context> | Class<TContext>,
  maybeHandle?: HandleValidationError<TContext>,
) {
  const context = maybeHandle
    ? (handleOrcontext as Class<TContext>)
    : (Context as unknown as Class<TContext>)

  const handle =
    maybeHandle ?? (handleOrcontext as HandleValidationError<Context>)

  return Middleware.from(context, async (context: TContext, next) => {
    try {
      return await next()
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error

      return handle(error, context, next)
    }
  })
}
