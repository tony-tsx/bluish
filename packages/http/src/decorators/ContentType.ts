import { Class, Context, Metadata } from '@bluish/core'

export function ContentType(
  type: string,
  to: (payload: unknown, context: Context) => unknown,
) {
  return (target: Class | object, propertyKey?: string | symbol) => {
    Metadata('@http:content-type', [{ type, to }], (value, previous) =>
      previous.concat(value),
    )(target, propertyKey)
  }
}

export interface ContentType {
  type: string
  to: (payload: unknown, context: Context) => unknown
}

declare global {
  namespace Bluish {
    namespace Controller {
      interface Metadata {
        '@http:content-type': ContentType[]
      }
    }

    namespace Action {
      interface Metadata {
        '@http:content-type': ContentType[]
      }
    }
  }
}
