import {
  PipeInput,
  Next,
  FunctionMiddleware,
  Context,
  IUsable,
  Application,
  Class,
} from '@bluish/core'
import { assert, Constructable, isGuard, ValidationError } from 'ornate-guard'

export interface GuardOptions {
  catch?: [
    context: Class<Context>,
    handle: (error: ValidationError, context: Context) => unknown,
  ][]
}

function guard({ catch: _catch = [] }: GuardOptions = {}): IUsable {
  return {
    use(target) {
      if (!(target instanceof Application))
        throw new TypeError(`Expected an Application instance`)

      target.usePipe(guard.pipe)

      for (const [context, handle] of _catch)
        target.useMiddleware(context, guard.onCatch(handle))
    },
  }
}

namespace guard {
  export async function pipe(input: PipeInput, next: Next) {
    if (typeof input.inject !== 'function') return next()

    if (!isGuard(input.inject)) return next()

    await next()

    input.value = await assert(input.value, input.inject as Constructable, {
      share: { context: input.module.context },
    })
  }

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
