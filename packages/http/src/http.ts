export { Accept } from './decorators/Accept.js'
export { ContentType } from './decorators/ContentType.js'
export { Controller } from './decorators/Controller.js'
export { Header } from './decorators/Header.js'
export { Param } from './decorators/Param.js'
export { Path } from './decorators/Path.js'
export {
  Route,
  HttpMethod,
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  TRACE,
  OPTIONS,
  CONNECT,
  HEAD,
} from './decorators/Route.js'
export { UseBody } from './decorators/UseBody.js'
export { UseHeader } from './decorators/UseHeader.js'
export { UseHeaders } from './decorators/UseHeaders.js'
export { UseParam } from './decorators/UseParam.js'
export { UseQuery } from './decorators/UseQuery.js'
export { UseResponse } from './decorators/UseResponse.js'
export { Version } from './decorators/Version.js'

export * from './errors/HttpError.js'

export { json, text, urlencoded } from './middlewares/body-parsers.js'

export {
  cookie,
  UseCookie,
  Cookie,
  CookieItem,
  CookieItemOptions,
  CookieItemSameSite,
  CookieOptions,
} from './middlewares/cookie.js'

export { cors } from './middlewares/cors.js'

export { HttpContext } from './models/HttpContext.js'
export { Request } from './models/Request.js'
export { Response } from './models/Response.js'

export { createBodyParser } from './tools/create-body-parser.js'
export {
  toAccept,
  toPath,
  toVersion,
  ToAcceptReturn,
} from './tools/action-helpers.js'

import {
  Injectable,
  MiddlewareRegistryLayer,
  Middleware,
  Setup,
} from '@bluish/core'
import { HttpContext } from './models/HttpContext.js'
import {
  BadRequest,
  HttpError,
  NotAcceptable,
  UnsupportedMediaType,
} from './errors/HttpError.js'
import { Request } from './models/Request.js'
import { toAccept, toContentTypes } from './tools/action-helpers.js'
import { is } from 'type-is'
import { json } from './middlewares/body-parsers.js'

Injectable(Request, {
  scope: 'request',
  resolve: context => context.request,
})

Middleware.register(
  MiddlewareRegistryLayer.Application,
  HttpContext,
  (context, next) => {
    context.response.headers['X-Powered-By'] =
      `Node ${process.version} / Bluish`

    return next()
  },
)

Middleware.register(
  [MiddlewareRegistryLayer.Application, MiddlewareRegistryLayer.Controller],
  HttpContext,
  async (context, next) => {
    try {
      return await next()
    } catch (error) {
      if (typeof error !== 'object') throw error

      if (!(error instanceof HttpError)) throw error

      context.response.status = error.status
      context.response.headers['Content-Type'] = 'application/json'
      context.response.body ??= JSON.stringify({
        error: error.name,
        message: error.message,
      })
    }
  },
)

Middleware.register(
  MiddlewareRegistryLayer.Application,
  HttpContext,
  (context, next) => {
    if (!context.request.headers.accept) return next()

    const contentTypes = toContentTypes(context.runner.action)

    if (!contentTypes.length) return next()

    const accepts = context.request.headers.accept
      .split(',')
      .map(type => type.trim().split(';')[0])

    const has = contentTypes.some(contentType =>
      accepts.some(accept => is(contentType.type, accept)),
    )

    if (!has)
      throw new NotAcceptable(
        'The requested content type is not available. Supported content types are: application/json, application/xml.',
      )

    return next()
  },
)

Middleware.register(
  MiddlewareRegistryLayer.Application,
  HttpContext,
  (context, next) => {
    const accept = toAccept(context.runner.action)

    context.response.headers['Accept'] = accept.formats

    if (accept.all) return next()

    if (!context.request.headers['content-type'])
      throw new BadRequest('Content-Type header is missing')

    if (!is(context.request.headers['content-type'], accept.formats))
      throw new UnsupportedMediaType('Unsupported media type')

    return next()
  },
)

export interface HttpSettings {
  json?: boolean
}

export default function http(settings: HttpSettings) {
  return new Setup({
    onAction(action) {
      if (settings.json) action.middlewares.unshift(json())
    },
    onController(controller) {
      if (settings.json) {
        controller.metadata['@http:content-type'] ??= []

        controller.metadata['@http:content-type'].push({
          type: 'application/json',
          to: payload => JSON.stringify(payload),
        })
      }
    },
  })
}
