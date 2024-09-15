import { HttpContext, HttpResponseStage } from '@bluish/http'
import http from 'http'
import { Request } from './Request.js'
import { Response } from './Response.js'
import { Router } from '@bluish/http-router'

export function toRequestListener(router: Router) {
  return async (
    _request: http.IncomingMessage,
    _response: http.ServerResponse,
  ) => {
    const response = new Response(_response)

    const context = new HttpContext(
      new Request(_request),
      new Response(_response),
    )

    await router.dispatch(context)

    if (response.stage < HttpResponseStage.HeaderSent) {
      _response.writeHead(context.response.status, context.response.headers)
      response.stage = HttpResponseStage.HeaderSent
    }

    if (response.stage < HttpResponseStage.Sent) {
      _response.end(context.response.body)
      response.stage = HttpResponseStage.Sent
    }
  }
}
