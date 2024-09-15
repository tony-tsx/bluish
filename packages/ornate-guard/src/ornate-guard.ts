import { PipeInput, Next, FunctionMiddleware, Context } from '@bluish/core'
import { assert, Constructable, isGuard, ValidationError } from 'ornate-guard'

async function guard(input: PipeInput, next: Next) {
  if (typeof input.inject !== 'function') return next()

  if (!isGuard(input.inject)) return next()

  await next()

  input.value = await assert(input.value, input.inject as Constructable, {
    share: { context: input.module.context },
  })
}

namespace guard {
  export function onCatch<TContext extends Context>(
    handle: (error: ValidationError, context: TContext) => unknown,
  ): FunctionMiddleware<TContext> {
    return async (context, next) => {
      try {
        return await next()
      } catch (error) {
        if (!(error instanceof ValidationError)) throw error

        return handle(error, context)
      }
    }
  }
}

export default guard
