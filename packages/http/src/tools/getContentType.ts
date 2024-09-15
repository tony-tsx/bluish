import { ApplicationSourceAction } from '@bluish/core'
import { ApplicationHttpSourceContentType } from '../models/ApplicationHttpSourceContentType.js'
import { HTTP_CONTENT_TYPE } from '../constants/constants.js'

export function getContentType(
  action: ApplicationSourceAction,
): ApplicationHttpSourceContentType[] {
  return [
    action.metadata.get(HTTP_CONTENT_TYPE),
    action.controller.metadata.get(HTTP_CONTENT_TYPE),
    action.controller.application.metadata.get(HTTP_CONTENT_TYPE),
  ]
    .filter(contentType => contentType !== undefined)
    .flat(1)
}
