import { Controller, getMetadataArgsStorage } from '../core.js'
import { isSameController } from '../tools/isSameController.js'

export function buildControllerIsolated(controller: Controller) {
  for (const isolated of getMetadataArgsStorage().isolated) {
    if (isolated.propertyKey) continue

    if (!isSameController(controller, isolated.target)) continue

    controller.isIsolated = true

    break
  }
}
