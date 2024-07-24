import { Controller, getMetadataArgsStorage } from '../core.js'
import { isSameController } from '../tools/isSameController.js'

export function buildControllerMetadata(controller: Controller) {
  for (const metadata of getMetadataArgsStorage().metadatas) {
    if (!isSameController(controller, metadata.target)) continue

    if (metadata.propertyKey) continue

    Object.assign(controller.metadata, {
      [metadata.key]:
        typeof controller.metadata[metadata.key] !== 'undefined'
          ? metadata.reducer(metadata.value, controller.metadata[metadata.key])
          : metadata.value,
    })
  }
}
