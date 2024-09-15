import { HttpMiddleware } from './HttpMiddleware.js'

export class HttpResponseStatusMiddleware extends HttpMiddleware {
  constructor() {
    super(async (context, next) => {
      await next()

      if (context.response.status !== undefined) return

      if (context.response.body === null) context.response.status = 204
      else if (context.request.method === 'POST') context.response.status = 201
      else context.response.status = 200
    })
  }
}
