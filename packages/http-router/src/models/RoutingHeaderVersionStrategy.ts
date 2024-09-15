import { Application } from '@bluish/core'
import { RoutingVersionStrategy } from './RoutingVersionStrategy.js'
import { FactoryRoutingStrategy, RoutingStrategy } from './RoutingStrategy.js'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'

const defaultRule = /v(\d+)/

export class RoutingHeaderVersionStrategy<
  TVersion extends number = number,
  TRoutingStrategy extends RoutingStrategy = RoutingRunStrategy,
> extends RoutingVersionStrategy<TVersion, TRoutingStrategy> {
  constructor(
    public readonly headerName: string,
    application: Application,
    factoryRoutingStrategy?: FactoryRoutingStrategy<TVersion, TRoutingStrategy>,
  ) {
    super(application, {
      extractVersionFromHttpContext(context) {
        const value = context.request.headers[headerName]

        if (!value) return null

        if (typeof value !== 'string') return null

        const [version] = defaultRule.exec(value) ?? []

        if (!version) return null

        if (isNaN(Number(version))) return null

        return Number(version) as TVersion
      },
      isLatest: (latest, version) => version > latest,
      factoryRoutingStrategy,
    })
  }
}
