import { Application, ApplicationSourceAction } from '@bluish/core'
import { RoutingStrategy } from './RoutingStrategy.js'
import {
  ALL_HTTP_METHODS,
  HTTP_METHOD,
  getAccept,
  HttpContext,
  UnsupportedMediaType,
  HttpTools,
} from '@bluish/http'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'

export class RoutingAcceptStrategyMatch {
  constructor(public readonly accept: string | undefined) {}

  public type(contentType: string | undefined) {
    if (contentType === this.accept) return true

    if (!contentType) return false

    if (!this.accept) return false

    return HttpTools.contentTypeIs(contentType, this.accept)
  }
}

export class RoutingAcceptStrategy<
  TRoutingStrategy extends RoutingStrategy,
> extends RoutingStrategy {
  public readonly accepts: [RoutingAcceptStrategyMatch, TRoutingStrategy][] = []

  #fallback: ApplicationSourceAction

  constructor(
    application: Application,
    public readonly factoryRoutingStrategy = RoutingRunStrategy.default<
      RoutingAcceptStrategyMatch,
      TRoutingStrategy
    >(),
  ) {
    super(application)

    this.#fallback = this.application.useAction(HttpContext, () => {
      throw new UnsupportedMediaType()
    })

    this.#fallback.metadata.set(HTTP_METHOD, new Set(ALL_HTTP_METHODS))
  }

  public track(action: ApplicationSourceAction) {
    const _accepts = getAccept(action)

    for (const accepts of _accepts) {
      for (const accept of accepts.accept) {
        let item = this.accepts.find(
          ([routePathItemOperationAcceptMatch]) =>
            routePathItemOperationAcceptMatch.accept === accept,
        )

        if (!item) {
          const match = new RoutingAcceptStrategyMatch(accept)

          item = [match, this.factoryRoutingStrategy(match, this.application)]

          this.accepts.push(item)
        }

        item[1].track(action)
      }
    }

    let item = this.accepts.find(
      ([routePathItemOperationAcceptMatch]) =>
        routePathItemOperationAcceptMatch.accept === undefined,
    )

    if (!item) {
      const match = new RoutingAcceptStrategyMatch(undefined)

      item = [match, this.factoryRoutingStrategy(match, this.application)]

      this.accepts.push(item)
    }

    item[1].track(action)
  }

  public dispatch(context: HttpContext): Promise<unknown> {
    const contentType = context.request.headers['content-type']

    for (const [match, strategy] of this.accepts) {
      if (match.type(contentType)) return strategy.dispatch(context)
    }

    return this.#fallback.run(context)
  }
}
