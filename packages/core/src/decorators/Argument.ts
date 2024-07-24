import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { Class } from '../typings/Class.js'
import { Action } from './Action.js'

export function Argument(
  selector: (context: Context) => unknown,
): (
  target: Class | object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => void
export function Argument<TContext extends Context>(
  context: Class<TContext>,
  selector: (context: TContext) => unknown,
): (
  target: Function | object,
  propertyKey: string | symbol,
  parameterIndex: number,
) => void
export function Argument<TContext extends Context>(
  contextOrSelector: Class<TContext> | ((context: TContext) => unknown),
  maybeSelector?: (context: Context) => unknown,
) {
  const context = maybeSelector
    ? (contextOrSelector as Class<TContext>)
    : Context
  const selector = maybeSelector
    ? (maybeSelector as (context: Context) => unknown)
    : (contextOrSelector as (context: Context) => unknown)

  return (
    target: Class | object,
    propertyKey: string | symbol,
    parameterIndex: number,
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

export interface ArgumentSelector {
  context: Class<Context>
  selector: (context: Context) => unknown
}

export interface Argument {
  target: Class | object
  propertyKey: string | symbol
  parameterIndex: number
  action: Action
  selectors: ArgumentSelector[]
  metadata: Partial<Bluish.Argument.Metadata>
  type: any
}

declare global {
  namespace Bluish {
    namespace Argument {
      interface Metadata {}
    }
  }
}
