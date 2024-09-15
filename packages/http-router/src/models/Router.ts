import { Application } from '@bluish/core'
import { RoutingStrategy } from './RoutingStrategy.js'
import { RoutingPathStrategy } from './RoutingPathStrategy.js'
import { RoutingMethodStrategy } from './RoutingMethodStrategy.js'
import { RoutingAcceptStrategy } from './RoutingAcceptStrategy.js'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'
import { HttpContext } from '@bluish/http'
import { isHttpContext } from '../tools/isHttpContext.js'

export class Router {
  constructor(
    public readonly application: Application,
    public readonly strategy: RoutingStrategy = new RoutingPathStrategy(
      application,
      (path, application) =>
        new RoutingMethodStrategy(
          application,
          (method, application) =>
            new RoutingAcceptStrategy(
              application,
              (accept, application) => new RoutingRunStrategy(application),
            ),
        ),
    ),
  ) {
    const actions = Array.from(application.controllers).flatMap(controller =>
      Array.from(controller.actions),
    )

    for (const action of actions)
      if (isHttpContext(action.context)) this.strategy.track(action)
  }

  public dispatch(context: HttpContext): Promise<unknown> {
    return this.strategy.dispatch(context)
  }

  public async run<THttpContext extends HttpContext>(
    context: THttpContext,
  ): Promise<THttpContext> {
    await this.dispatch(context)

    return context
  }
}
