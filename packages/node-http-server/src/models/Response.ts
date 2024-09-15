import { HttpResponse } from '@bluish/http'
import type http from 'node:http'

export class Response extends HttpResponse {
  constructor(public readonly native: http.ServerResponse) {
    super()
  }
}
