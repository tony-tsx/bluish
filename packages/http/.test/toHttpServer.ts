import { Action, Application, Runner, toRunner } from '@bluish/core'
import { IncomingMessage, ServerResponse } from 'http'
import { HttpMethod } from '../src/decorators/Route.js'
import { pathToRegexp } from 'path-to-regexp'
import {
  toAccept,
  ToAcceptReturn,
  toPath,
  toVersion,
} from '../src/tools/action-helpers.js'
import { Request } from '../src/models/Request.js'
import { Response } from '../src/models/Response.js'
import { HttpContext } from '../src/models/HttpContext.js'
import { NotFound } from '../src/errors/HttpError.js'
import { is } from 'type-is'

interface Route {
  methods: HttpMethod[]
  accept: ToAcceptReturn
  path: string
  version: number | undefined
  regexp: ReturnType<typeof pathToRegexp>
  runner: Runner
  action: Action
}

export function toHttpServer(app: Application) {
  const routes: Route[] = []

  let latestVersion: number | undefined = undefined

  for (const controller of app.controllers) {
    for (const action of controller.actions) {
      if (action.context !== HttpContext) continue

      const accept = toAccept(action)

      const version = toVersion(action)

      let path = toPath(action)

      if (version !== undefined) path = `/v${version}${path}`

      const runner = toRunner(action)

      const regexp = pathToRegexp(path)

      const route: Route = {
        methods: action.metadata['@http:methods']!,
        accept,
        path,
        version,
        regexp,
        runner,
        action,
      }

      routes.push(route)

      if (version === undefined) continue

      if (latestVersion === undefined || version > latestVersion)
        latestVersion = version
    }
  }

  for (const route of routes.slice()) {
    if (route.version === undefined || route.version !== latestVersion) continue

    const path = toPath(route.action)

    const regexp = pathToRegexp(path)

    routes.unshift({
      ...route,
      path,
      regexp,
      version: latestVersion,
    })
  }

  const notFound = app.virtual(HttpContext, () => {
    throw new NotFound()
  })

  return async (request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(`http://${process.env.HOST ?? '0.0.0.0'}${request.url}`)

    const req = Object.assign(new Request(), {
      body: request,
      headers: request.headers,
      method: request.method!.toUpperCase(),
      url,
      params: {},
      query: Object.fromEntries(url.searchParams),
    })

    const res = new Response()

    const context = new HttpContext(req, res)

    for (const route of routes) {
      if (!route.methods.includes(req.method)) continue

      if (
        !route.accept.all &&
        req.headers['content-type'] &&
        !is(req.headers['content-type'], route.accept.formats)
      )
        continue

      const result = route.regexp.exec(req.url.pathname)

      if (!result) continue

      route.regexp.keys.forEach((key, index) => {
        context.request.params[key.name] = result[index + 1]
      })

      await route.runner.run(context)

      response.writeHead(context.response.status, context.response.headers)
      response.end(context.response.body)

      return
    }

    await notFound.run(context)

    response.writeHead(context.response.status, context.response.headers)
    response.end(context.response.body)

    return
  }
}
