import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { isMatchToClass } from '../tools/isMatchToClass.js'
import { Class, Constructable } from '../typings/Class.js'
import { Application } from './Application.js'
import { ApplicationControllerActionCollection } from './ApplicationControllerActionCollection.js'
import { ApplicationSourceArguments } from './ApplicationSourceArguments.js'
import {
  getMetadataArgsStorage,
  MetadataControllerArg,
} from './MetadataArgsStorage.js'
import { ApplicationSourceProperties } from './ApplicationSourceProperties.js'
import { ApplicationSourceMiddlewareCollection } from './ApplicationSourceMiddlewareCollection.js'
import { ApplicationSourcePropertiesInjectCollection } from './ApplicationSourcePropertiesInjectCollection.js'
import { ApplicationSourcePipeCollection } from './ApplicationSourcePipeCollection.js'
import { Context } from './Context.js'
import { ApplicationSourceMetadata } from './ApplicationSourceMetadata.js'

export class ApplicationController {
  public readonly target: Constructable

  public readonly isIsolated: boolean

  public readonly actions = new ApplicationControllerActionCollection(this)

  public readonly middlewares: ApplicationSourceMiddlewareCollection

  public readonly pipes: ApplicationSourcePipeCollection

  public readonly arguments = new ApplicationSourceArguments()

  public readonly properties = new ApplicationSourceProperties()

  public readonly metadata = new ApplicationSourceMetadata()

  public readonly static = new ApplicationSourcePropertiesInjectCollection()

  public is(target: Class | object) {
    return isMatchToClass(this.target, target)
  }

  constructor(
    public readonly application: Application,
    public readonly _controller: MetadataControllerArg,
  ) {
    this.target = _controller.target

    const args = getMetadataArgsStorage()

    const paramtypes = getReflectMetadata<unknown[]>(
      'design:paramtypes',
      this.target,
    )

    if (paramtypes) this.metadata.set('design:paramtypes', paramtypes)

    this.isIsolated = args.isolated.some(_isolated => this.is(_isolated))

    this.middlewares = new ApplicationSourceMiddlewareCollection(
      !this.isIsolated ? this.application.middlewares : null,
    )
    this.pipes = new ApplicationSourcePipeCollection(
      !this.isIsolated ? this.application.pipes : null,
    )

    if (paramtypes)
      for (const [parameterIndex, paramtype] of paramtypes.entries())
        this.arguments.injects.add({
          target: this.target,
          ref: () => paramtype,
          parameterIndex,
        })

    for (const _action of args.actions)
      if (this.is(_action.target)) this.actions.add(_action)

    for (const _metadata of args.metadatas) {
      if (!this.is(_metadata.target)) continue

      if (_metadata.parameterIndex !== undefined) continue

      if (_metadata.propertyKey !== undefined) continue

      this.metadata.add(_metadata)
    }

    for (const _selector of args.selectors) {
      if (!this.is(_selector.target)) continue

      if (_selector.parameterIndex === undefined) {
        if (_selector.propertyKey === undefined) continue // TODO

        this.properties.selectors.add(_selector)

        continue
      }

      this.arguments.selectors.add(_selector)
    }

    for (const _inject of args.injects) {
      if (!this.is(_inject.target)) continue

      if (_inject.propertyKey === undefined) {
        if (_inject.parameterIndex === undefined) continue // TODO

        this.arguments.injects.add(_inject)

        continue
      }

      if (_inject.parameterIndex !== undefined) continue

      if (typeof _inject.target === 'function') this.static.add(_inject)
      else this.properties.injects.add(_inject)
    }

    for (const _middleware of args.middlewares) {
      if (_middleware.propertyKey !== undefined) continue

      if (!this.is(_middleware.target)) continue

      this.middlewares.add(_middleware)
    }

    for (const _pipe of getMetadataArgsStorage().pipes) {
      if (_pipe.propertyKey !== undefined) continue

      if (!this.is(_pipe.target)) continue

      this.pipes.add(_pipe)
    }
  }

  public async toInstance(context: Context) {
    const [args, properties] = await Promise.all([
      this.arguments.toArguments(context.module),
      this.properties.toProperties(context.module),
    ])

    const target = new this.target!(...args)

    Object.assign(target, properties)

    return target
  }
}
