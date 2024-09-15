import { HttpMethod } from '../http.js'

export const HTTP_CONTEXT_ACTION_CONTENT_TYPE = Symbol()

export const HTTP_CONTEXT_ACTION_CONTENT_MIME_TYPE = Symbol()

export const HTTP_ACCEPT = Symbol()

export const HTTP_CONTENT_TYPE = Symbol()

export const HTTP_PATH = Symbol()

export const HTTP_VERSION = Symbol()

export const HTTP_METHOD = Symbol()

export const ALL_HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
  'TRACE',
  'CONNECT',
] as const satisfies HttpMethod[]

export const HTTP_QUALIFIED_ACCEPT = Symbol()
