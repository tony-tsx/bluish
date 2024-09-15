import { Class, Metadata } from '@bluish/core'
import { HTTP_PATH } from '../constants/constants.js'

export function Path(_path: string | string[]) {
  const paths = Array.isArray(_path)
    ? _path
    : _path.startsWith('/')
      ? _path.split('/').slice(1)
      : _path.split('/')

  return (target: Class | object, propertyKey?: string | symbol) => {
    Metadata(HTTP_PATH, paths, (value, previous) => previous.concat(value))(
      target,
      propertyKey,
    )
  }
}
