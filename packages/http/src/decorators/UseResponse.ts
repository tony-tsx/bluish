import { Argument } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export const UseResponse = Argument(HttpContext, context => context.response)
