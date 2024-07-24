import { Action, Controller, Middleware } from '../core.js'

export function toMiddlewares(action: Action) {
  if (action.isIsolated)
    return [...Middleware.middlewares, ...action.middlewares]

  const middlewares = Controller.each(
    action.controller,
    controller => controller.middlewares,
  )
    .reverse()
    .flat(1)

  if (action.controller.isIsolated)
    return [...Middleware.middlewares, ...middlewares, ...action.middlewares]

  return [
    ...action.controller.application.middlewares,
    ...Middleware.middlewares,
    ...middlewares,
    ...action.middlewares,
  ]
}
