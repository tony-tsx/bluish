import { Application } from '@bluish/core'
import { RoutingVersionStrategy } from './RoutingVersionStrategy.js'
import { FactoryRoutingStrategy, RoutingStrategy } from './RoutingStrategy.js'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'

const defaultRule = /v(\d+)/

export class RoutingPathVersionStrategy<
  TVersion extends number = number,
  TRoutingStrategy extends RoutingStrategy = RoutingRunStrategy,
> extends RoutingVersionStrategy<TVersion, TRoutingStrategy> {
  constructor(
    application: Application,
    factoryRoutingStrategy?: FactoryRoutingStrategy<TVersion, TRoutingStrategy>,
  ) {
    super(application, {
      extractVersionFromHttpContext(context) {
        const [firstPath] = context.request.url.pathname.split('/')

        if (!firstPath) return null

        const [version] = defaultRule.exec(firstPath) ?? []

        if (!version) return null

        if (isNaN(Number(version))) return null

        return Number(version) as TVersion
      },
      isLatest: (latest, version) => version > latest,
      factoryRoutingStrategy,
    })
  }
}
