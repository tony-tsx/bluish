import { Action } from '../decorators/Action.js'
import { Runner } from '../models/Runner.js'

export function toRunner(action: Action) {
  return new Runner(action)
}
