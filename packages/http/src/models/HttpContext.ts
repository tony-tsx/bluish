import { Context } from '@bluish/core'
import { Request } from './Request.js'
import { Response } from './Response.js'

export class HttpContext extends Context {
  constructor(
    public readonly request: Request,
    public readonly response: Response,
  ) {
    super()
  }
}

export interface HttpContext extends Bluish.HttpContext {}

declare global {
  namespace Bluish {
    interface HttpContext {}
  }
}
