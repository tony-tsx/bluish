import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { is } from '../tools/is.js'
import { Class } from '../typings/Class.js'
import { Next } from './Next.js'

export type InputSelector<TContext extends Context = Context, TThis = any> = (
  this: TThis,
  context: TContext,
  next: Next,
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
