import {
  ALL_HTTP_METHODS,
  getMethods,
  HTTP_METHOD,
  HttpContext,
  HttpMethod,
  MethodNotAllowed,
} from '@bluish/http'
import { RoutingStrategy } from './RoutingStrategy.js'
import { Application, ApplicationSourceAction } from '@bluish/core'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'

export class RoutingMethodStrategy<
  TRoutingStrategy extends RoutingStrategy,
> extends RoutingStrategy {
  public readonly methods = new Map<HttpMethod, TRoutingStrategy>()

  #fallback: ApplicationSourceAction

  constructor(
    application: Application,
    public readonly factoryRoutingStrategy = RoutingRunStrategy.default<
      HttpMethod,
      TRoutingStrategy
    >(),
  ) {
    super(application)

    this.#fallback = this.application.useAction(HttpContext, () => {
      throw new MethodNotAllowed()
    })

    this.#fallback.metadata.set(HTTP_METHOD, new Set(ALL_HTTP_METHODS))
  }

  public track(action: ApplicationSourceAction) {
    for (const method of getMethods(action)) {
      if (!this.methods.has(method))
        this.methods.set(
          method,
          this.factoryRoutingStrategy(method, this.application),
        )

      this.methods.get(method)!.track(action)
    }
  }

  public dispatch(context: HttpContext): Promise<unknown> {
    const routePathItemOperation = this.methods.get(context.request.method)

    if (!routePathItemOperation) return this.#fallback.run(context)

    return routePathItemOperation.dispatch(context)
  }
}
