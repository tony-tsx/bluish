import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'
import { Next } from './Next.js'

export type InputSelector<TContext extends Context = Context> = (
  context: TContext,
  next: Next,
) => unknown

export function Input(
  selector: InputSelector,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Input<TContext extends Context>(
  context: Class<TContext> | InputSelector,
  selector: InputSelector<TContext>,
): (
  target: Class | object,
  propertyKey: undefined | string | symbol,
  parameterIndex?: number,
) => void
export function Input<TContext extends Context>(
  contextOrSelector: Class<TContext> | InputSelector,
  maybeSelector?: InputSelector<TContext>,
) {
  const context = maybeSelector
    ? (contextOrSelector as Class<Context>)
    : Context

  const selector =
    (maybeSelector as InputSelector | undefined) ||
    (contextOrSelector as InputSelector)

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
    })
  }
}
