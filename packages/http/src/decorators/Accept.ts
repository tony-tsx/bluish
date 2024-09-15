import { Use } from '@bluish/core'
import { ApplicationHttpSourceAccept } from '../models/ApplicationHttpSourceAccept.js'

export function Accept(accept: ApplicationHttpSourceAccept) {
  return Use(accept)
}

export type Accept = ApplicationHttpSourceAccept
