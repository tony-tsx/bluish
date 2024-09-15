import { ApplicationSourceAction } from '@bluish/core'
import { HTTP_PATH } from '../constants/constants.js'

const APPLICATION_SOURCE_ACTION_PATH = Symbol()

export function getPath(action: ApplicationSourceAction) {
  if (action.metadata.has(APPLICATION_SOURCE_ACTION_PATH))
    return action.metadata.get(APPLICATION_SOURCE_ACTION_PATH)

  const path =
    '/' +
    [action.controller.metadata.get(HTTP_PATH), action.metadata.get(HTTP_PATH)]
      .filter(path => path !== undefined)
      .flat(1)
      .join('/')

  action.metadata.set(APPLICATION_SOURCE_ACTION_PATH, path)

  return path
}
