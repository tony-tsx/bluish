import { Class } from '../typings/Class.js'
import { Next } from '../typings/Next.js'
import { Context } from './Context.js'

export type FunctionMiddleware<TContext extends Context = Context> = (
  context: TContext,
  next: Next,
) => unknown | Promise<unknown>

export type AnyMiddleware<TContext extends Context = Context> =
  | Middleware<TContext>
  | FunctionMiddleware<TContext>

export enum MiddlewareRegistryLayer {
  Application = 'application',
  Controller = 'controller',
  Action = 'action',
}

export abstract class Middleware<TContext extends Context = Context> {
  public static layers: Record<MiddlewareRegistryLayer, Middleware[]> = {
    [MiddlewareRegistryLayer.Application]: [],
    [MiddlewareRegistryLayer.Controller]: [],
    [MiddlewareRegistryLayer.Action]: [],
  }

  public static from<TContext extends Context>(
    context: Class<TContext> | Class<TContext>[],
    handle: FunctionMiddleware<TContext>,
  ): AnonymousMiddleware<TContext>
  public static from(
    handle: AnyMiddleware<Context>,
  ): AnonymousMiddleware<Context>
  public static from<TContext extends Context>(
    context: Class<TContext> | Class<TContext>[] | AnyMiddleware<Context>,
    maybeHandle?: FunctionMiddleware<TContext>,
  ): AnonymousMiddleware<Context> | AnonymousMiddleware<TContext>
  public static from<TContext extends Context>(
    contextOrMiddleware:
      | Class<TContext>
      | Class<TContext>[]
      | AnyMiddleware<Context>,
    maybeHandle?: FunctionMiddleware<TContext>,
  ) {
    if (Array.isArray(contextOrMiddleware)) {
      if (!maybeHandle) throw new Error('Middleware handle is required')

      if (!maybeHandle.name)
        return new AnonymousMiddleware(contextOrMiddleware, maybeHandle)

      return toNamedMiddleware(
        maybeHandle.name,
        contextOrMiddleware,
        maybeHandle,
      )
    }

    if (typeof contextOrMiddleware === 'object') return contextOrMiddleware

    if (maybeHandle)
      return Middleware.from(
        [contextOrMiddleware as Class<TContext>],
        maybeHandle,
      )

    return Middleware.from([Context], contextOrMiddleware as FunctionMiddleware)
  }

  public static register<TContext extends Context>(
    layer: MiddlewareRegistryLayer | MiddlewareRegistryLayer[],
    contextOrMiddleware:
      | Class<TContext>
      | Class<TContext>[]
      | AnyMiddleware<Context>,
    maybeHandle?: FunctionMiddleware<TContext>,
  ) {
    const layers = Array.isArray(layer) ? layer : [layer]

    layers.forEach(layer => {
      this.layers[layer].push(Middleware.from(contextOrMiddleware, maybeHandle))
    })
  }

  public abstract context: Class<TContext>[]

  public abstract handle(context: TContext, next: Next): unknown
}

class AnonymousMiddleware<
  TContext extends Context = Context,
> extends Middleware<TContext> {
  public context: Class<TContext>[]

  constructor(
    context: Class<TContext> | Class<TContext>[],
    public readonly handle: FunctionMiddleware<TContext>,
  ) {
    super()

    this.context = Array.isArray(context)
      ? (context as Class<TContext>[])
      : [context as Class<TContext>]
  }
}

function toNamedMiddleware<TContext extends Context>(
  name: string,
  context: Class<TContext> | Class<TContext>[],
  handle: FunctionMiddleware<TContext>,
) {
  class NamedMiddleware extends Middleware<TContext> {
    public context = Array.isArray(context) ? context : [context]

    public handle = handle
  }

  Object.defineProperty(NamedMiddleware, 'name', {
    value: `${name[0].toUpperCase()}${name.slice(1)}Middleware`,
  })

  return new NamedMiddleware()
}
