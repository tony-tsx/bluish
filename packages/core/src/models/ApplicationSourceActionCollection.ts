import { Collection } from '../helpers/Collection.js'
import { Class } from '../typings/Class.js'
import { ApplicationSource } from './ApplicationSource.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { Context } from './Context.js'
import { MetadataActionArg, MetadataArg } from './MetadataArgsStorage.js'

export class ApplicationSourceActionCollection extends Collection<ApplicationSourceAction> {
  constructor(public readonly controller: ApplicationSource) {
    super()
  }

  public filterByContext(context: Class<Context>) {
    return this.filter(action => action.of(context))
  }

  public findByStaticPropertyKey(propertyKey: string | symbol) {
    return this.findByPropertyKey(propertyKey, true)
  }

  public findByInstancePropertyKey(propertyKey: string | symbol) {
    return this.findByPropertyKey(propertyKey, false)
  }

  public findByPropertyKey(propertyKey: string | symbol, isStatic: boolean) {
    return this.find(action => {
      if (action.isStatic !== isStatic) return false

      return action._action.propertyKey === propertyKey
    })
  }

  public findBy(target: Class | object, propertyKey: string | symbol) {
    return this.find(action => action.is({ target, propertyKey }))
  }

  public hasBy(target: Class | object, propertyKey: string | symbol) {
    return this.some(action => action.is({ target, propertyKey }))
  }

  public add(_arg: MetadataActionArg | ApplicationSourceAction | MetadataArg) {
    if (_arg instanceof ApplicationSourceAction) return super.add(_arg)

    if (_arg.type === 'action')
      return super.add(new ApplicationSourceAction(this.controller, _arg))

    if (_arg.propertyKey === undefined)
      throw new TypeError('Property key is required')

    const action = this.findBy(_arg.target, _arg.propertyKey)

    if (!action) throw new TypeError('Action not found')

    action.add(_arg)

    return this
  }
}
