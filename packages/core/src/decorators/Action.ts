import { Context } from '../models/Context.js'
import { actionDecoratorFactory } from '../tools/action-decorator-factory/action-decorator-factory.js'

export const Action = actionDecoratorFactory({ context: Context })
