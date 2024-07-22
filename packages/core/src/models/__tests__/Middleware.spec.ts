import { describe, expect, it } from 'vitest'
import { Middleware } from '../Middleware.js'
import { Context } from '../Context.js'

describe('.from', async () => {
  it('with fn', () => {
    const middleware = Middleware.from((context, next) => next())

    expect(middleware).toBeInstanceOf(Middleware)
  })

  it('set anonymous middleware with arrow function', () => {
    const middleware = Middleware.from((context, next) => next())

    expect(middleware.constructor.name).toBe('AnonymousMiddleware')
  })

  it('set anonymous middleware with function', () => {
    const middleware = Middleware.from(function (context, next) {
      return next()
    })

    expect(middleware.constructor.name).toBe('AnonymousMiddleware')
  })

  it('set named middleware with function', () => {
    const middleware = Middleware.from(function test(context, next) {
      return next()
    })

    expect(middleware.constructor.name).toBe('TestMiddleware')
  })

  it('with specific context', () => {
    class TestContext extends Context {}

    const middleware = Middleware.from(TestContext, (context, next) => next())

    expect(middleware.context).toEqual([TestContext])
  })

  it('with multiple context', () => {
    class TestContext1 extends Context {}

    class TestContext2 extends Context {}

    const middleware = Middleware.from(
      [TestContext1, TestContext2],
      (context, next) => next(),
    )

    expect(middleware.context).toEqual([TestContext1, TestContext2])
  })
})
