import { MiddlewareCompose } from '@bluish/core'
import { HttpErrorMiddleware } from './middlewares/HttpErrorMiddleware.js'
import { HttpResponseBodyMiddleware } from './middlewares/HttpResponseBodyMiddleware.js'
import { HttpResponseStatusMiddleware } from './middlewares/HttpResponseStatusMiddleware.js'
import { HttpRequestBodyMiddleware } from './middlewares/HttpRequestBodyMiddleware.js'
import { HttpRequestParamsMiddleware } from './middlewares/HttpRequestParamsMiddleware.js'

export * from './accepts/ApplicationHttpSourceAcceptUrlEncoded.js'

export * from './constants/constants.js'

export * from './decorators/Accept.js'
export * from './decorators/Body.js'
export * from './decorators/ContentType.js'
export * from './decorators/Header.js'
export * from './decorators/HttpController.js'
export * from './decorators/Param.js'
export * from './decorators/Path.js'
export * from './decorators/Response.js'
export * from './decorators/Route.js'
export * from './decorators/Query.js'
export * from './decorators/Response.js'
export * from './decorators/Route.js'
export * from './decorators/Version.js'

export * from './errors/HttpError.js'
export * from './errors/HttpActionInternalServerError.js'

export * from './interfaces/IHttpRequest.js'
export * from './interfaces/IHttpResponse.js'

export * from './middlewares/HttpMiddleware.js'
export * from './modules/cookie.js'
export * from './modules/cors.js'
export * from './modules/session.js'

export * from './models/ApplicationHttpSourceAccept.js'
export * from './models/ApplicationHttpSourceAcceptSessionBufferAlloc.js'
export * from './models/ApplicationHttpSourceContentType.js'
export * from './models/HttpContext.js'

export * from './tools/getAccept.js'
export * from './tools/getContentType.js'
export * from './tools/getMethods.js'
export * from './tools/getPath.js'
export * from './tools/getVersion.js'

export * as HttpTools from './tools/http-tools.js'

export default function http() {
  const middleware = new MiddlewareCompose([
    new HttpErrorMiddleware(),
    new HttpResponseStatusMiddleware(),
    new HttpResponseBodyMiddleware(),
    new HttpRequestBodyMiddleware(),
    new HttpRequestParamsMiddleware(),
  ])

  return middleware
}
