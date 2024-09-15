import { Class } from '../typings/Class.js'
import { ApplicationSource } from './ApplicationSource.js'
import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { MetadataActionArg, MetadataArg } from './MetadataArgsStorage.js'

export class ApplicationSourceActionCollection extends Set<ApplicationSourceAction> {
  constructor(public readonly controller: ApplicationSource) {
    super()
  }

  public findByStaticPropertyKey(propertyKey: string | symbol) {
    return this.findByPropertyKey(propertyKey, true)
  }

  public findByInstancePropertyKey(propertyKey: string | symbol) {
    return this.findByPropertyKey(propertyKey, false)
  }

  public findByPropertyKey(propertyKey: string | symbol, isStatic: boolean) {
    for (const action of this) {
      if (action.isStatic !== isStatic) continue

      if (action._action.propertyKey === propertyKey) return action
    }
  }

  public findBy(target: Class | object, propertyKey: string | symbol) {
    for (const action of this)
      if (action.is({ target, propertyKey })) return action
  }

  public hasBy(target: Class | object, propertyKey: string | symbol) {
    for (const action of this)
      if (action.is({ target, propertyKey })) return true
    return false
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
