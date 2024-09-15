import { Application, ApplicationSourceAction } from '@bluish/core'
import { FactoryRoutingStrategy, RoutingStrategy } from './RoutingStrategy.js'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'
import {
  ALL_HTTP_METHODS,
  getVersion,
  HTTP_METHOD,
  HttpContext,
  NotFound,
} from '@bluish/http'

export interface RoutingVersionStrategyConfiguration<
  TVersion,
  TRoutingStrategy extends RoutingStrategy,
> {
  factoryRoutingStrategy?: FactoryRoutingStrategy<TVersion, TRoutingStrategy>
  extractVersionFromHttpContext(
    context: HttpContext,
  ): TVersion | undefined | null
  extractVersionFromApplicationSourceAction?(
    action: ApplicationSourceAction,
  ): TVersion | TVersion[]
  isLatest(latest: TVersion, version: TVersion): boolean
}

export class RoutingVersionStrategy<
  TVersion,
  TRoutingStrategy extends RoutingStrategy = RoutingRunStrategy,
> extends RoutingStrategy {
  public readonly versions = new Map<TVersion, TRoutingStrategy>()

  public latest!: TVersion

  readonly #fallback: ApplicationSourceAction

  readonly #configuration: Required<
    RoutingVersionStrategyConfiguration<TVersion, TRoutingStrategy>
  >

  constructor(
    application: Application,
    {
      extractVersionFromApplicationSourceAction = action =>
        getVersion(action) as TVersion[],
      factoryRoutingStrategy = RoutingRunStrategy.default(),
      ...configuration
    }: RoutingVersionStrategyConfiguration<TVersion, TRoutingStrategy>,
  ) {
    super(application)

    this.#configuration = {
      ...configuration,
      factoryRoutingStrategy,
      extractVersionFromApplicationSourceAction,
    }

    this.#fallback = this.application.useAction(HttpContext, () => {
      throw new NotFound()
    })

    this.#fallback.metadata.set(HTTP_METHOD, new Set(ALL_HTTP_METHODS))
  }

  public track(applicationSourceAction: ApplicationSourceAction): void {
    const version =
      this.#configuration.extractVersionFromApplicationSourceAction(
        applicationSourceAction,
      )

    if (!version) return

    const versions = Array.isArray(version) ? version : [version]

    for (const version of versions) {
      if (this.latest !== undefined) this.latest = version
      else if (this.#configuration.isLatest(this.latest, version))
        this.latest = version

      if (!this.versions.has(version))
        this.versions.set(
          version,
          this.#configuration.factoryRoutingStrategy(version, this.application),
        )

      this.versions.get(version)!.track(applicationSourceAction)
    }
  }

  public dispatch(context: HttpContext): Promise<unknown> {
    let version = this.#configuration.extractVersionFromHttpContext(context)

    if (!version) version = this.latest

    const routePathItemOperation = this.versions.get(version)

    if (!routePathItemOperation) return this.#fallback.run(context)

    return routePathItemOperation.dispatch(context)
  }
}
