import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'
import type { Context } from '../../models/Context.js'
import { is } from '../is.js'
import {
  ActionDecorator,
  ActionOptions,
  ActionPropertyDescriptor,
} from './action-decorator-types.js'
import { Class } from '../../typings/Class.js'
import { ApplicationSourceMetadataEntry } from '../../models/ApplicationSourceMetadata.js'
import { AnyMiddleware } from '../../models/Middleware.js'
import { ApplicationSourceAction } from '../../models/ApplicationSourceAction.js'
import { Input } from '../../decorators/Input.js'
export * from './action-decorator-types.js'

export interface ActionDecoratorFactoryOptions<
  TContext extends Context,
  TOptions extends object = {},
> {
  context: Class<TContext>
  metadata?: ApplicationSourceMetadataEntry
  middlewares?: AnyMiddleware[]
  input?: (context: TContext) => unknown
  construct?(
    applicationSourceAction: ApplicationSourceAction,
    options: TOptions,
  ): void
}

export function actionDecoratorFactory<
  TContext extends Context,
  TOptions extends object = {},
>({
  context: baseContext,
  metadata: baseMetadata,
  middlewares: baseMiddlewares = [],
  input,
  construct,
}: ActionDecoratorFactoryOptions<TContext, TOptions>): ActionDecorator<
  TContext,
  TOptions
> {
  return function Action<TContext extends Context>(
    maybeTargetOrContext?:
      | Class<TContext>
      | Class<object>
      | object
      | ((...args: any[]) => any)
      | TOptions,
    maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions?:
      | symbol
      | string
      | any[]
      | ((...args: any[]) => any)
      | (TOptions & ActionOptions),
    maybePropertyDescriptorOrParameterIndexOrRefsOrOptions?:
      | TypedPropertyDescriptor<any>
      | any[]
      | (TOptions & ActionOptions)
      | number,
    maybeOptions?: TOptions & ActionOptions,
  ): any {
    if (typeof maybeTargetOrContext === 'undefined') return Action

    if (typeof maybeTargetOrContext === 'object') {
      const target = maybeTargetOrContext

      if (
        typeof maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions ===
        'undefined'
      )
        return Action(baseContext, maybeTargetOrContext as TOptions)

      if (
        !is.propertyKey(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions)
      )
        throw new TypeError()

      if (is.number(maybePropertyDescriptorOrParameterIndexOrRefsOrOptions)) {
        if (!input) throw new TypeError()

        Input(baseContext, input)(
          target,
          maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions,
          maybePropertyDescriptorOrParameterIndexOrRefsOrOptions,
        )

        return void getMetadataArgsStorage().actions.push({
          context: baseContext,
          type: 'action',
          target,
          propertyKey: maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions,
          parameterIndex:
            maybePropertyDescriptorOrParameterIndexOrRefsOrOptions,
          metadata: [baseMetadata],
          options: {},
          middlewares: [baseMiddlewares],
          construct: construct,
        })
      }

      if (
        !is.object<ActionPropertyDescriptor>(
          maybePropertyDescriptorOrParameterIndexOrRefsOrOptions,
        )
      )
        throw new TypeError()

      return void getMetadataArgsStorage().actions.push({
        type: 'action',
        target,
        propertyKey: maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions,
        propertyDescriptor:
          maybePropertyDescriptorOrParameterIndexOrRefsOrOptions,
        metadata: [baseMetadata],
        options: {},
        middlewares: [baseMiddlewares],
        construct: construct,
      })
    }

    if (is.constructor(maybeTargetOrContext, baseContext)) {
      if (is.propertyKey(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions))
        throw new TypeError()

      if (is.array(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions))
        throw new TypeError()

      let options: ActionOptions | undefined

      if (is.func(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions)) {
        let refs: any[] = []

        const handle = maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions

        if (is.array(maybePropertyDescriptorOrParameterIndexOrRefsOrOptions))
          refs = maybePropertyDescriptorOrParameterIndexOrRefsOrOptions

        if (
          is.object<ActionOptions>(
            maybePropertyDescriptorOrParameterIndexOrRefsOrOptions,
          )
        )
          options = maybePropertyDescriptorOrParameterIndexOrRefsOrOptions
        else if (is.object(maybeOptions)) options = maybeOptions

        const { metadata, middlewares, ...opts } = options ?? {}

        return (target: Class) => {
          getMetadataArgsStorage().actions.push({
            type: 'action',
            target,
            context: maybeTargetOrContext,
            virtualizer: { handle, refs },
            metadata: [metadata, baseMetadata],
            options: opts,
            middlewares: [baseMiddlewares, middlewares],
            construct: construct,
          })
        }
      }

      options = maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions

      const { metadata, middlewares, ...opts } = options ?? {}

      return (
        target: Class,
        propertyKey: string | symbol,
        propertyDescriptorOrParameterIndex:
          | TypedPropertyDescriptor<any>
          | number,
      ) => {
        if (is.number(propertyDescriptorOrParameterIndex))
          if (input)
            Input(baseContext, input)(
              target,
              propertyKey,
              propertyDescriptorOrParameterIndex,
            )
          else throw new TypeError()

        getMetadataArgsStorage().actions.push({
          type: 'action',
          target,
          propertyKey,
          propertyDescriptor: is.object(propertyDescriptorOrParameterIndex)
            ? propertyDescriptorOrParameterIndex
            : undefined,
          parameterIndex: is.number(propertyDescriptorOrParameterIndex)
            ? propertyDescriptorOrParameterIndex
            : undefined,
          context: maybeTargetOrContext,
          metadata: [metadata, baseMetadata],
          options: opts,
          middlewares: [baseMiddlewares, middlewares],
          construct: construct,
        })
      }
    }

    if (is.propertyKey(maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions)) {
      if (is.number(maybePropertyDescriptorOrParameterIndexOrRefsOrOptions))
        return Action(baseContext)(
          maybeTargetOrContext as Class<object>,
          maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions as
            | string
            | symbol,
          maybePropertyDescriptorOrParameterIndexOrRefsOrOptions as TypedPropertyDescriptor<ActionOptions>,
        )

      if (is.object(maybePropertyDescriptorOrParameterIndexOrRefsOrOptions))
        return Action(baseContext)(
          maybeTargetOrContext as Class<object>,
          maybePropertyKeyOrVirtualRefsOrVirtualHandleOrOptions as
            | string
            | symbol,
          maybePropertyDescriptorOrParameterIndexOrRefsOrOptions as TypedPropertyDescriptor<ActionOptions>,
        )

      throw new TypeError()
    }

    if (!is.func(maybeTargetOrContext)) throw new TypeError()

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

    if (
      is.object<ActionOptions>(
        maybePropertyDescriptorOrParameterIndexOrRefsOrOptions,
      )
    )
      options = maybePropertyDescriptorOrParameterIndexOrRefsOrOptions

    const { metadata, middlewares, ...opts } = options ?? {}

    return (target: Class) => {
      getMetadataArgsStorage().actions.push({
        type: 'action',
        target,
        context: baseContext,
        virtualizer: { handle: maybeTargetOrContext, refs },
        metadata: [metadata, baseMetadata],
        options: opts,
        construct: construct,
        middlewares: [baseMiddlewares, middlewares],
      })
    }
  }
}
