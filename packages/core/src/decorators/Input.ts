import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { is } from '../tools/is.js'
import { Class } from '../typings/Class.js'

export type InputNext = (value: unknown) => Promise<unknown>

export type InputInjectSelector<
  TContext extends Context = Context,
  TThis = any,
> = (this: TThis, value: unknown, context: TContext, next: InputNext) => unknown

export type InputSelector<TContext extends Context = Context, TThis = any> = (
  this: TThis,
  context: TContext,
) => unknown

export function Input<TThis = any>(
  selector: InputSelector<Context, TThis>,
  deps?: (string | symbol)[],
): (
  target: Class<TThis> | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Input<TContext extends Context, TThis = unknown>(
  context: Class<TContext> | InputSelector<Context, TThis>,
  selector: InputSelector<TContext, TThis>,
  deps?: (string | symbol)[],
): (
  target: Class<TThis> | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Input<TContext extends Context>(
  contextOrSelector: Class<TContext> | InputSelector,
  maybeDepsOrSelector?: InputSelector<TContext> | (string | symbol)[],
  maybeDeps?: (string | symbol)[],
) {
  const deps = (() => {
    if (Array.isArray(maybeDeps)) return maybeDeps

    if (Array.isArray(maybeDepsOrSelector))
      return maybeDepsOrSelector ? maybeDepsOrSelector : []

    return []
  })()

  const context = is.constructor(contextOrSelector, Context)
    ? contextOrSelector
    : (Context as Class<Context>)

  const selector =
    typeof maybeDepsOrSelector === 'function'
      ? (maybeDepsOrSelector as InputSelector)
      : (contextOrSelector as InputSelector)

  return InputInject(
    context,
    function (this: any, value, context, next) {
      return next(selector.call(this, context))
    },
    deps,
  )
}

export function InputInject<TThis = any>(
  selector: InputInjectSelector<Context, TThis>,
  deps?: (string | symbol)[],
): (
  target: Class<TThis> | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function InputInject<TContext extends Context, TThis = unknown>(
  context: Class<TContext> | InputInjectSelector<Context, TThis>,
  selector: InputInjectSelector<TContext, TThis>,
  deps?: (string | symbol)[],
): (
  target: Class<TThis> | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function InputInject<TContext extends Context>(
  contextOrSelector: Class<TContext> | InputInjectSelector,
  maybeDepsOrSelector?: InputInjectSelector<TContext> | (string | symbol)[],
  maybeDeps?: (string | symbol)[],
) {
  const deps = (() => {
    if (Array.isArray(maybeDeps)) return maybeDeps

    if (Array.isArray(maybeDepsOrSelector))
      return maybeDepsOrSelector ? maybeDepsOrSelector : []

    return []
  })()

  const context = is.constructor(contextOrSelector, Context)
    ? contextOrSelector
    : (Context as Class<Context>)

  const selector =
    typeof maybeDepsOrSelector === 'function'
      ? (maybeDepsOrSelector as InputInjectSelector)
      : (contextOrSelector as InputInjectSelector)

  return (
    target: Class | object,
    propertyKey: undefined | string | symbol,
    parameterIndex?: number,
  ) => {
    getMetadataArgsStorage().inputs.push({
      type: 'input',
      target,
      propertyKey,
      parameterIndex,
      context,
      selector,
      deps,
    })
  }
}
