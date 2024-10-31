import type { Next } from '../decorators/Next.js'
import type { IUsable } from '../decorators/Use.js'
import type { Class } from '../typings/Class.js'
import { Application } from './Application.js'
import { ApplicationSource } from './ApplicationSource.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { ApplicationSourceArgument } from './ApplicationSourceArgument.js'
import { ApplicationSourceProperty } from './ApplicationSourceProperty.js'
import { Context } from './Context.js'

export type FunctionMiddleware<
  TContext extends Context = Context,
  TThis = Middleware<TContext>,
> = (this: TThis, context: TContext, next: Next) => unknown | Promise<unknown>

export type AnyMiddleware<TContext extends Context = any> =
  | Middleware<TContext>
  | FunctionMiddleware<TContext>

export class Middleware<TContext extends Context = Context> implements IUsable {
  public readonly context: Class<TContext>[]

  public run: (context: TContext, next: Next) => unknown

  public static from<TContext extends Context>(
    context: Class<TContext> | Class<TContext>[],
    run: FunctionMiddleware<TContext>,
  ): Middleware<TContext>
  public static from<TContext extends Context>(
    run: FunctionMiddleware<TContext>,
  ): Middleware<TContext>
  public static from<TContext extends Context>(
    contextOrAnyMiddleware:
      | Class<TContext>
      | Class<TContext>[]
      | AnyMiddleware<TContext>,
    maybeFunctionMiddleware?: FunctionMiddleware<TContext>,
  ): Middleware<TContext>
  public static from<TContext extends Context>(
    contextOrAnyMiddleware:
      | Class<TContext>
      | Class<TContext>[]
      | AnyMiddleware<TContext>,
    maybeFunctionMiddleware?: FunctionMiddleware<TContext>,
  ): Middleware<TContext> {
    if (typeof maybeFunctionMiddleware === 'function')
      return new Middleware(
        contextOrAnyMiddleware as Class<TContext> | Class<TContext>[],
        maybeFunctionMiddleware,
      )

    if (typeof contextOrAnyMiddleware === 'function')
      return new Middleware(
        contextOrAnyMiddleware as FunctionMiddleware<TContext>,
      )

    return contextOrAnyMiddleware as Middleware<TContext>
  }

  constructor(run: FunctionMiddleware<TContext>)
  constructor(
    context: Class<TContext> | Class<TContext>[],
    run: FunctionMiddleware<TContext>,
  )
  constructor(
    runOrContext:
      | FunctionMiddleware<TContext>
      | Class<TContext>
      | Class<TContext>[],
    maybeRun?: FunctionMiddleware<TContext>,
  )
  constructor(
    runOrContext:
      | FunctionMiddleware<TContext>
      | Class<TContext>
      | Class<TContext>[],
    maybeRun?: FunctionMiddleware<TContext>,
  ) {
    if (typeof maybeRun === 'function') {
      this.context = Array.isArray(runOrContext)
        ? (runOrContext as Class<TContext>[])
        : [runOrContext as Class<TContext>]
      this.run = maybeRun

      return this
    }

    this.context = [Context as unknown as Class<TContext>]
    this.run = runOrContext as FunctionMiddleware<TContext>
  }

  public use(
    target:
      | Application
      | ApplicationSource
      | ApplicationSourceAction
      | ApplicationSourceArgument
      | ApplicationSourceProperty,
  ) {
    if (target instanceof Application)
      return void target.middlewares.add(this as unknown as Middleware<Context>)

    if (target instanceof ApplicationSource)
      return void target.middlewares.add(this as unknown as Middleware<Context>)

    if (target instanceof ApplicationSourceAction)
      return void target.middlewares.add(this as unknown as Middleware<Context>)

    throw new TypeError()
  }
}
