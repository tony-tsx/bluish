import { Action, Controller } from '@bluish/core'

export interface ToAcceptReturn {
  formats: string[]
  all: boolean
}

function withCache<T>(fn: (action: Action) => T) {
  const cache = new Map<Action, T>()

  return (action: Action, refreshCache = false) => {
    if (!cache.has(action) || refreshCache) cache.set(action, fn(action))

    return cache.get(action)!
  }
}

export const toPath = withCache(function toPath(action: Action) {
  const paths = Controller.each(
    action.controller,
    controller => controller.metadata['@http:path'] ?? [],
  )
    .reverse()
    .flat(1)

  const path =
    '/' +
    [paths, action.metadata['@http:path']]
      .filter(path => path !== undefined)
      .flat(1)
      .join('/')

  return path
})

export const toVersion = withCache(function toVersion(action: Action) {
  if (action.metadata['@http:version']) return action.metadata['@http:version']

  return Controller.each(
    action.controller,
    controller => controller.metadata['@http:version'],
  ).find(version => !!version)
})

export const toAccept = withCache(function toAccept(
  action: Action,
): ToAcceptReturn {
  let formats = [
    action.controller.metadata['@http:accept'],
    action.metadata['@http:accept'],
  ]
    .filter(path => path !== undefined)
    .flat(1)

  if (!formats.length) formats = ['*/*']

  const all = formats.some(format => format.startsWith('*/*'))

  return { formats, all }
})
