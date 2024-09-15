import { ApplicationSourceAction } from '@bluish/core'
import { HTTP_VERSION } from '../constants/constants.js'

export function getVersion(action: ApplicationSourceAction): unknown[] {
  if (!action.controller.metadata.has(HTTP_VERSION))
    return action.metadata.get(HTTP_VERSION)

  if (!action.metadata.has(HTTP_VERSION))
    return action.controller.metadata.get(HTTP_VERSION)

  if (
    action.metadata.get(HTTP_VERSION) !==
    action.controller.metadata.get(HTTP_VERSION)
  )
    throw new TypeError()

  return action.metadata.get(HTTP_VERSION)
}
