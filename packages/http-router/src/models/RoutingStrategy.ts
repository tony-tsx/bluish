import { Application, ApplicationSourceAction } from '@bluish/core'
import { HttpContext } from '@bluish/http'

export type FactoryRoutingStrategy<
  T,
  TRoutingStrategy extends RoutingStrategy = RoutingStrategy,
> = (data: T, application: Application) => TRoutingStrategy

export abstract class RoutingStrategy {
  constructor(public readonly application: Application) {}

  public abstract track(action: ApplicationSourceAction): void

  public abstract dispatch(context: HttpContext): Promise<unknown>
}
