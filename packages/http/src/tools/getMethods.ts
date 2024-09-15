import { ApplicationSourceAction } from '@bluish/core'
import { HTTP_METHOD } from '../constants/constants.js'
import { HttpMethod } from '../decorators/Route.js'

export function getMethods(action: ApplicationSourceAction): HttpMethod[] {
  return action.metadata.get(HTTP_METHOD)
}
