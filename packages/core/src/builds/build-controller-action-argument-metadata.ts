import { getMetadataArgsStorage } from '../core.js'
import { Argument } from '../decorators/Argument.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionArgumentMetadata(argument: Argument) {
  for (const metadata of getMetadataArgsStorage().metadatas) {
    if (!metadata.propertyKey) continue

    if (metadata.parameterIndex === undefined) continue

    if (argument.parameterIndex !== metadata.parameterIndex) continue

    if (!isSameAction(argument.action, metadata.target, metadata.propertyKey))
      continue

    Object.assign(argument.metadata, {
      [metadata.key]:
        typeof argument.metadata[metadata.key] !== 'undefined'
          ? metadata.reducer(metadata.value, argument.metadata[metadata.key])
          : metadata.value,
    })
  }
}
