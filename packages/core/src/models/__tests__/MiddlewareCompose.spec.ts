import { expect, it, vi } from 'vitest'
import BluishCoreTesting from '../../core-testing.js'
import { Middleware } from '../Middleware.js'
import { MiddlewareCompose } from '../MiddlewareCompose.js'
import { Context } from '../Context.js'

it('exec middlewares in composition', async () => {
  const fn1 = vi.fn((context, next) => next())
  const fn2 = vi.fn((context, next) => next())

  const middleware1 = Middleware.from(fn1)
  const middleware2 = Middleware.from(fn2)

  const context = new Context()

  await BluishCoreTesting.runMiddleware(
    new MiddlewareCompose([middleware1, middleware2]),
    context,
  )

  expect(fn1).toHaveBeenCalledTimes(1)
  expect(fn2).toHaveBeenCalledTimes(1)
})

it('exec middlewares in composition', async () => {
  class TestContext extends Context {}

  const fn1 = vi.fn((context, next) => next())
  const fn2 = vi.fn((context, next) => next())

  const middleware1 = Middleware.from(TestContext, fn1)
  const middleware2 = Middleware.from(TestContext, fn2)

  const middleware = new MiddlewareCompose([middleware1, middleware2])

  const context = new TestContext()

  await BluishCoreTesting.runMiddleware(middleware, context)

  expect(fn1).toHaveBeenCalledTimes(1)
  expect(fn2).toHaveBeenCalledTimes(1)
})
