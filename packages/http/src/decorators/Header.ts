import { Use } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export function Header(name: string, value: string | string[]) {
  return Use(HttpContext, (context, next) => {
    context.response.headers[name] = value

    return next()
  })
}
