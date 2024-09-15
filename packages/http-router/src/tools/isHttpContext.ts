import { Class, Context } from '@bluish/core'
import { HttpContext } from '@bluish/http'

export function isHttpContext(context: Class<Context>) {
  if (context === HttpContext) return true

  return context.prototype instanceof HttpContext
}
