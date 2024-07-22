import { Class, Metadata } from '@bluish/core'

export function Accept(accept: string | string[]) {
  const accepts = Array.isArray(accept) ? accept : [accept]

  return (target: Class | Object, propertyKey: string | symbol) => {
    Metadata('http:accept', accepts, (value, previous) =>
      previous.concat(value),
    )(target, propertyKey)
  }
}

declare global {
  namespace Bluish {
    namespace Controller {
      interface Metadata {
        '@http:accept': string[]
      }
    }

    namespace Action {
      interface Metadata {
        '@http:accept': string[]
      }
    }
  }
}
