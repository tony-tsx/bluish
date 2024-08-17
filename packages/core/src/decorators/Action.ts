import { Class } from '../typings/Class.js'
import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'

export function Action(
  target: Class | object,
  propertyKey: symbol | string,
): void
export function Action<TContext extends Context>(
  context: Class<TContext>,
): (target: Class | object, propertyKey: symbol | string) => void
export function Action<TContext extends Context>(
  targetOrContext: Class<TContext> | Class | object,
  maybePropertyKey?: symbol | string,
) {
  if (maybePropertyKey !== undefined) {
    getMetadataArgsStorage().actions.push({
      target: targetOrContext,
      propertyKey: maybePropertyKey,
    })

    return
  }

  return (target: Class | object, propertyKey: symbol | string) => {
    getMetadataArgsStorage().actions.push({
      context: targetOrContext as Class<Context>,
      target,
      propertyKey,
    })
  }
}
