import { Class } from '../../typings/Class.js'
import { Context } from '../../models/Context.js'
import { AnyMiddleware } from '../../models/Middleware.js'
import { ApplicationSourceMetadataEntry } from '../../models/ApplicationSourceMetadata.js'

export interface ActionOptions {
  metadata?: ApplicationSourceMetadataEntry
  middlewares?: AnyMiddleware[]
}

export type ActionPropertyDescriptor = TypedPropertyDescriptor<ActionFunction>

export type ActionFunction = (...args: any[]) => any

export interface ActionDecorator<
  TContext extends Context,
  TOptions extends object = {},
> {
  /**
   * @example
   *  ```ts
   *  class Controller {
   *    ＠Action
   *    public action() {}
   *  }
   *  ```
   */
  (
    target: Class | object,
    propertyKey: symbol | string,
    propertyDescriptor: TypedPropertyDescriptor<ActionFunction>,
  ): void
  /**
   * @example
   *  ```ts
   *  class Controller {
   *    public action(＠Action input: any) {}
   *  }
   *  ```
   */
  (
    target: Class | object,
    propertyKey: symbol | string,
    parameterIndex: number,
  ): void
  /**
   * @example
   *
   * ```ts
   * ＠Action(SomeContext, async () => {
   *  // ...
   * })
   * class Controller {}
   * ```
   */
  (
    context: Class<TContext>,
    handle: (...args: any[]) => any,
    options?: TOptions & ActionOptions,
  ): (target: Class | object) => void
  /**
   * @example
   *
   * ```ts
   * ＠Action(SomeContext, async (context: Context) => {
   *  // ...
   * }, [Context])
   * class Controller {}
   * ```
   */
  (
    context: Class<TContext>,
    handle: (...args: any[]) => any,
    refs?: any[],
    options?: TOptions & ActionOptions,
  ): (target: Class | object) => void
  /**
   * @example
   *
   * ```ts
   * ＠Action(async () => {
   *   // ...
   * })
   * class Controller {}
   * ```
   */
  (
    handle: (...args: any[]) => any,
    options?: TOptions & ActionOptions,
  ): (target: Class | object) => void
  /**
   * @example
   *
   * ```ts
   * ＠Action(async (context: Context) => {
   *  // ...
   * }, [Context])
   * class Controller {}
   * ```
   */
  (
    handle: (...args: any[]) => any,
    refs?: any[],
    options?: TOptions & ActionOptions,
  ): (target: Class | object) => void
  /**
   * @example
   *
   * ```ts
   * @Action(async () => {
   *   // ...
   * })
   * class Controller {}
   * ```
   */
  (
    handle: (...args: any[]) => any,
    options?: TOptions & ActionOptions,
  ): (target: Class | object) => void
  /**
   * @example
   *  ```ts
   *  class SomeContext extends Context {}
   *
   *  class Controller {
   *    ＠Action(SomeContext)
   *    public action() {}
   *  }
   *  ```
   */
  (
    context: Class,
    options?: TOptions & ActionOptions,
  ): (
    target: Class | object,
    propertyKey: symbol | string,
    propertyDescriptor: TypedPropertyDescriptor<ActionFunction>,
  ) => void
  /**
   * @example
   * ```ts
   * class Controller {
   *   ＠Action()
   *   public action() {}
   * }
   * ```
   *
   * ```ts
   * class Controller {
   *   public action(＠Action() input: unknown) {}
   * }
   * ```
   */
  (options?: TOptions & ActionOptions): {
    (
      target: Class | object,
      propertyKey: symbol | string,
      propertyDescriptor: TypedPropertyDescriptor<ActionFunction>,
    ): void
    (
      target: Class | object,
      propertyKey: symbol | string,
      parameterIndex: number,
    ): void
  }
  (
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
      | (TOptions & ActionOptions),
    maybePropertyDescriptorOrRefsOrOptions?:
      | TypedPropertyDescriptor<any>
      | any[]
      | (TOptions & ActionOptions),
    maybeOptions?: TOptions & ActionOptions,
  ): any
}
