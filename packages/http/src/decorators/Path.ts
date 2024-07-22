import { Metadata } from '@bluish/core'

export function Path(path: string | string[]) {
  const paths = Array.isArray(path)
    ? path
    : path.startsWith('/')
      ? path.split('/').slice(1)
      : path.split('/')

  return Metadata('@http:path', paths, (value, previous) =>
    previous.concat(value),
  )
}

declare global {
  namespace Bluish {
    namespace Controller {
      interface Metadata {
        '@http:path': string[]
      }
    }

    namespace Action {
      interface Metadata {
        '@http:path': string[]
      }
    }
  }
}
