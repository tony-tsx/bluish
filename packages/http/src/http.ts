export { Accept } from './decorators/Accept.js'
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
export { Version } from './decorators/Version.js'

export { HttpError } from './errors/HttpError.js'

export { json, text, urlencoded } from './middlewares/body-parsers.js'

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

import { Injectable, Middleware } from '@bluish/core'
import { HttpContext } from './models/HttpContext.js'
import {
  BadRequest,
  HttpError,
  UnsupportedMediaType,
} from './errors/HttpError.js'
import { Request } from './models/Request.js'
import { toAccept } from './tools/action-helpers.js'
import { is } from 'type-is'

Injectable(Request, {
  scope: 'request',
  resolve: context => context.request,
})

Middleware.register(HttpContext, async function http(context, next) {
  context.response.headers['X-Powered-By'] = `Node ${process.version} / Bluish`

  const accept = toAccept(context.runner.action)

  context.response.headers['Accept'] = accept.formats

  try {
    if (accept.all) return await next()

    if (!context.request.headers['content-type'])
      throw new BadRequest('Content-Type header is missing')

    if (!is(context.request.headers['content-type'], accept.formats))
      throw new UnsupportedMediaType('Unsupported media type')

    return await next()
  } catch (error) {
    if (typeof error !== 'object') throw error

    if (!(error instanceof HttpError)) throw error

    context.response.status = error.status
    context.response.headers['Content-Type'] = 'application/json'
    context.response.body ??= { error: error.name, message: error.message }
  }
})
