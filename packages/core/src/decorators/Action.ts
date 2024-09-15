import { Class } from '../typings/Class.js'
import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'

export function Action(
  target: Class | object,
  propertyKey: symbol | string,
  propertyDescriptor: TypedPropertyDescriptor<any>,
): void
export function Action<TContext extends Context>(
  context: Class<TContext>,
): (
  target: Class | object,
  propertyKey: symbol | string,
  propertyDescriptor: TypedPropertyDescriptor<any>,
) => void
export function Action<TContext extends Context>(
  targetOrContext: Class<TContext> | Class | object,
  propertyKey?: symbol | string,
  propertyDescriptor?: TypedPropertyDescriptor<any>,
) {
  if (propertyKey !== undefined) {
    getMetadataArgsStorage().actions.push({
      type: 'action',
      target: targetOrContext,
      propertyKey,
      propertyDescriptor,
    })

    return
  }

  return (
    target: Class | object,
    propertyKey: symbol | string,
    propertyDescriptor: TypedPropertyDescriptor<any>,
  ) => {
    getMetadataArgsStorage().actions.push({
      type: 'action',
      context: targetOrContext as Class<Context>,
      target,
      propertyKey,
      propertyDescriptor,
    })
  }
}
