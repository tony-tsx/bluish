import { Class } from '../typings/Class.js'
import { Context } from '../models/Context.js'
import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'
import { is } from '../tools/is.js'

export type ActionFunction = (...args: any[]) => any

export type ActionPropertyDescriptor = TypedPropertyDescriptor<ActionFunction>

type ActPropDesc = ActionPropertyDescriptor

export interface ActionOptions {
  metadata?: Record<string | symbol, any>
}

export function Action(
  target: Class | object,
  propertyKey: symbol | string,
  propertyDescriptor: TypedPropertyDescriptor<ActionFunction>,
): void
export function Action<TContext extends Context>(
  context: Class<TContext>,
  handle: (...args: any[]) => any,
  refs?: any[],
  options?: ActionOptions,
): (target: Class | object) => void
export function Action<TContext extends Context>(
  context: Class<TContext>,
  handle: (...args: any[]) => any,
  options?: ActionOptions,
): (target: Class | object) => void
export function Action(
  handle: (...args: any[]) => any,
  refs?: any[],
  options?: ActionOptions,
): (target: Class | object) => void
export function Action(
  handle: (...args: any[]) => any,
  options?: ActionOptions,
): (target: Class | object) => void
export function Action<TContext extends Context>(
  context: Class<TContext>,
  options?: ActionOptions,
): (
  target: Class | object,
  propertyKey: symbol | string,
  propertyDescriptor: TypedPropertyDescriptor<any>,
) => void
export function Action<TContext extends Context>(
  targetOrContext:
    | Class<TContext>
    | Class<object>
    | object
    | ((...args: any[]) => any),
  maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions?:
    | symbol
    | string
    | any[]
    | ((...args: any[]) => any)
    | ActionOptions,
  maybePropertyDescriptorOrRefsOrOptions?:
    | TypedPropertyDescriptor<any>
    | any[]
    | ActionOptions,
  maybeOptions?: ActionOptions,
): any {
  if (typeof targetOrContext === 'object') {
    const target = targetOrContext

    if (!is.propertyKey(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions))
      throw new TypeError()

    if (!is.object<ActPropDesc>(maybePropertyDescriptorOrRefsOrOptions))
      throw new TypeError()

    getMetadataArgsStorage().actions.push({
      type: 'action',
      target,
      propertyKey: maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions,
      propertyDescriptor: maybePropertyDescriptorOrRefsOrOptions,
    })

    return
  }

  if (is.constructor(targetOrContext, Context)) {
    if (is.propertyKey(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions))
      throw new TypeError()

    if (is.array(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions))
      throw new TypeError()

    let options: ActionOptions | undefined

    if (is.func(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions)) {
      let refs: any[] = []

      const handle = maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions

      if (is.array(maybePropertyDescriptorOrRefsOrOptions))
        refs = maybePropertyDescriptorOrRefsOrOptions

      if (is.object<ActionOptions>(maybePropertyDescriptorOrRefsOrOptions))
        options = maybePropertyDescriptorOrRefsOrOptions
      else if (is.object(maybeOptions)) options = maybeOptions

      return (target: Class) => {
        getMetadataArgsStorage().actions.push({
          type: 'action',
          target,
          context: targetOrContext,
          virtualizer: { handle, refs },
          metadata: options?.metadata,
        })
      }
    }

    options = maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions

    return (
      target: Class,
      propertyKey: string | symbol,
      propertyDescriptor: TypedPropertyDescriptor<any>,
    ) => {
      getMetadataArgsStorage().actions.push({
        type: 'action',
        target,
        propertyKey,
        propertyDescriptor,
        context: targetOrContext,
        metadata:
          maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions?.metadata,
      })
    }
  }

  if (is.propertyKey(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions)) {
    if (!is.object(maybePropertyDescriptorOrRefsOrOptions))
      throw new TypeError()

    return Action(Context)(
      targetOrContext as Class<object>,
      maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions as string | symbol,
      maybePropertyDescriptorOrRefsOrOptions as TypedPropertyDescriptor<ActionOptions>,
    )
  }

  if (!is.func(targetOrContext)) throw new TypeError()

  let refs: any[]
  let options: ActionOptions = {}

  if (is.array(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions))
    refs = maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions
  else if (
    is.object<ActionOptions>(
      maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions,
    )
  )
    options = maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions

  if (is.object<ActionOptions>(maybePropertyDescriptorOrRefsOrOptions))
    options = maybePropertyDescriptorOrRefsOrOptions

  return (target: Class) => {
    getMetadataArgsStorage().actions.push({
      type: 'action',
      target,
      context: Context,
      virtualizer: { handle: targetOrContext, refs },
      metadata: options?.metadata,
    })
  }
}
