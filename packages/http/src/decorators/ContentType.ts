import { Use } from '@bluish/core'
import { ApplicationHttpSourceContentType } from '../models/ApplicationHttpSourceContentType.js'

export function ContentType(contentType: ApplicationHttpSourceContentType) {
  return Use(contentType)
}
