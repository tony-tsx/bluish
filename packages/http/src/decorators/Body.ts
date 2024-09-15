import { Input } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export const Body = Input(HttpContext, context => context.request.body)
