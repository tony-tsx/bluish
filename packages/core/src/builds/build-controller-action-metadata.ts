import { Action, getMetadataArgsStorage } from '../core.js'
import { isSameAction } from '../tools/isSameAction.js'

export function buildControllerActionMetadata(action: Action) {
  for (const metadata of getMetadataArgsStorage().metadatas) {
    if (!metadata.propertyKey) continue

    if (!isSameAction(action, metadata.target, metadata.propertyKey)) continue

    Object.assign(action.metadata, {
      [metadata.key]:
        typeof action.metadata[metadata.key] !== 'undefined'
          ? metadata.reducer(metadata.value, action.metadata[metadata.key])
          : metadata.value,
    })
  }
}
