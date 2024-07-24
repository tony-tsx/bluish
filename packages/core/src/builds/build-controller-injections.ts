import { Controller, getMetadataArgsStorage } from '../core.js'
import { getReflectMetadata } from '../tools/getReflectMetadata.js'
import { isSameController } from '../tools/isSameController.js'

export function buildControllerInjection(controller: Controller) {
  const paramtypes = getReflectMetadata('design:paramtypes', controller.target)

  if (Array.isArray(paramtypes)) {
    paramtypes.forEach((target, parameterIndex) => {
      if (!target) return

      if (target === Object) return

      if (target === Function) return

      if (target === String) return

      if (target === Number) return

      if (target === Boolean) return

      if (target === Array) return

      if (target === Promise) return

      if (target === Date) return

      if (target === RegExp) return

      controller.injections.parameters.set(parameterIndex, () => target)
    })
  }

  for (const inject of getMetadataArgsStorage().injects) {
    if (!isSameController(controller, inject.target)) continue

    if (inject.propertyKey) {
      if (inject.parameterIndex !== undefined) continue

      if (typeof inject.target === 'function') {
        controller.injections.static.set(inject.propertyKey, inject.injectable)

        continue
      }

      controller.injections.properties.set(
        inject.propertyKey,
        inject.injectable,
      )

      continue
    }

    if (inject.parameterIndex === undefined) continue

    controller.injections.parameters.set(
      inject.parameterIndex,
      inject.injectable,
    )
  }
}
