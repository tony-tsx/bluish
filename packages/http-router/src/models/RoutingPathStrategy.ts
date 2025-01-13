import { ApplicationSourceAction, Application } from '@bluish/core'
import {
  HttpContext,
  NotFound,
  HTTP_METHOD,
  ALL_HTTP_METHODS,
  getPath,
} from '@bluish/http'
import { RoutingStrategy } from './RoutingStrategy.js'
import {
  Key,
  match,
  MatchFunction,
  ParamData,
  pathToRegexp,
} from 'path-to-regexp'
import { RoutingRunStrategy } from './RoutingRunStrategy.js'

export class PathRoutingStrategyMatch {
  readonly #match: MatchFunction<ParamData>

  public readonly keys: Key[]

  constructor(public readonly path: string) {
    const { keys } = pathToRegexp(path)

    this.keys = keys
    this.#match = match(path)
  }

  public match(path: string) {
    return this.#match(path)
  }
}

export class RoutingPathStrategy<
  TRoutingStrategy extends RoutingStrategy,
> extends RoutingStrategy {
  #fallback!: ApplicationSourceAction

  public readonly paths: [PathRoutingStrategyMatch, TRoutingStrategy][] = []

  constructor(
    application: Application,
    public readonly factoryRoutingStrategy = RoutingRunStrategy.default<
      PathRoutingStrategyMatch,
      TRoutingStrategy
    >(),
  ) {
    super(application)

    this.#fallback = this.application.useAction(HttpContext, () => {
      throw new NotFound()
    })

    this.#fallback.metadata.set(HTTP_METHOD, new Set(ALL_HTTP_METHODS))
  }

  public track(action: ApplicationSourceAction) {
    const path = getPath(action)

    let _path = this.paths.find(([match]) => match.path === path)

    if (!_path) {
      const match = new PathRoutingStrategyMatch(path)

      for (const [index, [_match]] of this.paths.entries()) {
        if (match.keys.length >= _match.keys.length) continue

        _path = [match, this.factoryRoutingStrategy(path, this.application)]

        this.paths.splice(index, 0, _path)

        break
      }

      if (!_path) {
        _path = [match, this.factoryRoutingStrategy(path, this.application)]

        this.paths.push(_path)
      }
    }

    _path[1].track(action)
  }

  public dispatch(context: HttpContext): Promise<unknown> {
    for (const [match, strategy] of this.paths) {
      const result = match.match(context.request.self.pathname)

      if (!result) continue

      Object.assign(context.request.params, result.params)

      return strategy.dispatch(context)
    }

    return this.#fallback.run(context)
  }
}
