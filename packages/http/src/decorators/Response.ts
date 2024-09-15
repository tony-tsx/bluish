import { Input } from '@bluish/core'
import { HttpContext } from '../models/HttpContext.js'

export const Response = Input(HttpContext, context => context.response)

export const Res = Response

export const Request = Input(HttpContext, context => context.request)

export const Req = Request
