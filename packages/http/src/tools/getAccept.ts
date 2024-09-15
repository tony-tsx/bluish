import { ApplicationSourceAction } from '@bluish/core'
import { ApplicationHttpSourceAccept } from '../models/ApplicationHttpSourceAccept.js'
import { HTTP_ACCEPT } from '../constants/constants.js'

export function getAccept(
  action: ApplicationSourceAction,
): ApplicationHttpSourceAccept[] {
  if (action.isIsolated)
    action.metadata.get(HTTP_ACCEPT) as ApplicationHttpSourceAccept[]

  if (action.controller.isIsolated)
    return [
      action.metadata.get(HTTP_ACCEPT) as
        | undefined
        | ApplicationHttpSourceAccept[],
      action.controller.metadata.get(HTTP_ACCEPT) as
        | undefined
        | ApplicationHttpSourceAccept[],
    ]
      .filter(accepts => accepts !== undefined)
      .flat()
      .sort((acceptLeft, acceptRight) => {
        if (acceptLeft.piority === acceptRight.piority) return 0

        return acceptLeft.piority < acceptRight.piority ? -1 : 1
      })

  return [
    action.metadata.get(HTTP_ACCEPT) as
      | undefined
      | ApplicationHttpSourceAccept[],
    action.controller.metadata.get(HTTP_ACCEPT) as
      | undefined
      | ApplicationHttpSourceAccept[],
    action.controller.application.metadata.get(HTTP_ACCEPT) as
      | undefined
      | ApplicationHttpSourceAccept[],
  ]
    .filter(accepts => accepts !== undefined)
    .flat()
    .sort((acceptLeft, acceptRight) => {
      if (acceptLeft.piority === acceptRight.piority) return 0

      return acceptLeft.piority < acceptRight.piority ? -1 : 1
    })
}
