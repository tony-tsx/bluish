import { ApplicationSourceAction } from '@bluish/core'
import { HttpContext } from '@bluish/http'
import { FactoryRoutingStrategy, RoutingStrategy } from './RoutingStrategy.js'

export class RoutingRunStrategy extends RoutingStrategy {
  public readonly action!: ApplicationSourceAction | null

  public static default<
    T,
    TRoutingStrategy extends RoutingStrategy,
  >(): FactoryRoutingStrategy<T, TRoutingStrategy> {
    return (_, application) =>
      new this(application) as unknown as TRoutingStrategy
  }

  public track(action: ApplicationSourceAction): void {
    if (this.action)
      throw new TypeError('An action has already been added to this operation')

    // @ts-expect-error: TODO
    this.action = action
  }

  public dispatch(context: HttpContext): Promise<unknown> {
    return this.action!.run(context)
  }
}
