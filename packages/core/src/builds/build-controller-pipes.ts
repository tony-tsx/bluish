import { Controller, getMetadataArgsStorage } from '../core.js'
import { isSameController } from '../tools/isSameController.js'

export function buildControllerPipes(controller: Controller) {
  for (const pipe of getMetadataArgsStorage().pipes) {
    if (!isSameController(controller, pipe.target)) continue

    controller.pipes.push(pipe.pipe)
  }
}
