import qs from 'qs'
import nodeqs from 'node:querystring'
import { createBodyParser } from '../tools/createBodyParser.js'

export interface UrlEncodedOptions {
  extended?: boolean
  parameterLimit?: number
}

export const urlencoded = createBodyParser<UrlEncodedOptions>({
  name: 'urlencoded',
  accept: '*/x-www-form-urlencoded',
  parse: (input: string, { extended }) =>
    extended ? qs.parse(input) : nodeqs.parse(input),
})

export const json = createBodyParser({
  name: 'json',
  accept: '*/json',
  parse: input => JSON.parse(input),
})

export const text = createBodyParser({
  name: 'text',
  accept: '*/text',
  parse: input => input,
})
