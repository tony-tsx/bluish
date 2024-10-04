import { Class } from '../typings/Class.js'
import { InputSelector } from '../decorators/Input.js'
import { Context } from './Context.js'
import { MetadataInputArg } from './MetadataArgsStorage.js'
import { Next } from '../decorators/Next.js'

export class ApplicationSourceInput {
  public readonly get: InputSelector

  public readonly context: Class<Context>

  public is(context: Context) {
    return context instanceof this.context
  }

  constructor(public readonly _input: MetadataInputArg) {
    this.get = _input.selector
    this.context = _input.context ?? Context
  }

  public call(target: any, context: Context, next: Next) {
    return this.get.call(target, context, next)
  }
}
