import {
  PipeInput,
  FunctionMiddleware,
  Context,
  IUsable,
  Application,
  Class,
  PipeNext,
} from '@bluish/core'
import { assert, Constructable, isGuard, ValidationError } from 'ornate-guard'

export interface GuardOptions {
  catch?: [
    context: Class<Context>,
    handle: (error: ValidationError, context: Context) => unknown,
  ][]
  share?: (context: Context) => object | Promise<object>
}

function guard(options: GuardOptions = {}): IUsable {
  const { catch: _catch = [] } = options
  return {
    use(target) {
      if (!(target instanceof Application))
        throw new TypeError(`Expected an Application instance`)

      target.usePipe(guard.pipe(options))

      for (const [context, handle] of _catch)
        target.useMiddleware(context, guard.onCatch(handle))
    },
  }
}

namespace guard {
  export function pipe({ share }: GuardOptions) {
    return async (input: PipeInput, next: PipeNext) => {
      if (typeof input.inject !== 'function') return next()

      if (!isGuard(input.inject)) return next()

      const value = await assert(input.value, input.inject as Constructable, {
        share: {
          context: input.module.context,
          ...(await share?.(input.module.context)),
        },
      })

      input.module.guards ??= []

      input.module.guards.push(input.value)

      return next(value)
    }
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

declare module '@bluish/core' {
  interface Module {
    guards?: object[]
  }
}

declare module 'ornate-guard' {
  interface ContextShare {
    context: Context
  }
}

export default guard
