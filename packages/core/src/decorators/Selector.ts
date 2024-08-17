import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'
import { Next } from '../typings/Next.js'

export type SelectorFunction<TContext extends Context = Context> = (
  context: TContext,
  next: Next,
) => unknown

export function Selector(
  selector: SelectorFunction,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Selector<TContext extends Context>(
  context: Class<TContext> | SelectorFunction,
  selector: SelectorFunction<TContext>,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Selector<TContext extends Context>(
  contextOrSelector: Class<TContext> | SelectorFunction,
  maybeSelector?: SelectorFunction<TContext>,
) {
  const context = maybeSelector
    ? (contextOrSelector as Class<Context>)
    : Context

  const selector =
    (maybeSelector as SelectorFunction | undefined) ||
    (contextOrSelector as SelectorFunction)

  return (
    target: Class | object,
    propertyKey: undefined | string | symbol,
    parameterIndex?: number,
  ) => {
    getMetadataArgsStorage().selectors.push({
      target,
      propertyKey,
      parameterIndex,
      context,
      selector,
    })
  }
}

export interface Selector {
  target: Class | object
  propertyKey: undefined | string | symbol
  parameterIndex: undefined | number
  context: Class<Context>
  selector: SelectorFunction
}
