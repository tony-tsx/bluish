import { Class, Metadata } from '@bluish/core'

export function Version(verison: number) {
  return (target: Class | object, propertyKey?: string | symbol) => {
    Metadata('@http:version', verison)(target, propertyKey)
  }
}

declare global {
  namespace Bluish {
    namespace Controller {
      interface Metadata {
        '@http:version': number
      }
    }

    namespace Action {
      interface Metadata {
        '@http:version': number
      }
    }
  }
}
