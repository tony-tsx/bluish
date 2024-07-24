import { Action, Controller, Middleware } from '../core.js'

export function toMiddlewares(action: Action) {
  if (action.isIsolated)
    return [
      ...Middleware.layers.application,
      ...Middleware.layers.controller,
      ...Middleware.layers.action,
      ...action.middlewares,
    ]

  const middlewares = Controller.each(
    action.controller,
    controller => controller.middlewares,
  )
    .reverse()
    .flat(1)

  if (action.controller.isIsolated)
    return [
      ...Middleware.layers.application,
      ...Middleware.layers.controller,
      ...middlewares,
      ...Middleware.layers.action,
      ...action.middlewares,
    ]

  return [
    ...Middleware.layers.application,
    ...action.controller.application.middlewares,
    ...Middleware.layers.controller,
    ...middlewares,
    ...Middleware.layers.action,
    ...action.middlewares,
  ]
}
