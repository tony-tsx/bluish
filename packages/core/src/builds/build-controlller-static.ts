import { Controller } from '../core.js'

export function buildControllerStatic(controller: Controller) {
  for (const [
    propertyKey,
    injectableReference,
  ] of controller.injections.static.entries()) {
    const injectable =
      controller.application['_findInjectable'](injectableReference)

    if (!injectable) throw new Error('Injectable not found')

    if (injectable.scope !== 'singleton')
      throw new Error(
        'Injectable non singleton not supported in static injection',
      )

    Object.defineProperty(controller.target, propertyKey, {
      value: controller.application['_castInjectable'](injectable),
      configurable: false,
      enumerable: true,
      writable: false,
    })
  }
}
