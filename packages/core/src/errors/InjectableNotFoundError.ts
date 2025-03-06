import { refToString } from '../tools/refToString.js'

export class InjectableNotFoundError extends Error {
  constructor(ref: unknown) {
    const refStr = refToString(ref)
    super(`Injectable not found: ${refStr}`)
  }
}
