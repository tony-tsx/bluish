import { describe, expect, it, vi } from 'vitest'
import BluishCoreTesting from '../core-testing.js'
import { Action } from '../decorators/Action.js'
import { Controller } from '../decorators/Controller.js'
import { Context } from '../models/Context.js'
import { Selector } from '../decorators/Selector.js'
import { Inject } from '../decorators/Inject.js'
import { Injectable } from '../decorators/Injectable.js'

describe('.run', () => {
  it('static action', async () => {
    @Controller
    class Test {
      @Action(Context)
      public static action() {}
    }

    vi.spyOn(Test, 'action')

    await BluishCoreTesting.run(Test, 'action', new Context())

    expect(Test.action).toHaveBeenCalled()
  })

  it('action', async () => {
    const action = vi.fn()
    @Controller
    class Test {
      @Action(Context)
      public action(...args: unknown[]) {
        return action(...args)
      }
    }

    await BluishCoreTesting.run(Test.prototype, 'action', new Context())

    expect(action).toHaveBeenCalled()
  })
})

describe('.runInject', () => {
  it('static action', async () => {
    @Injectable
    class Service {}

    const value = await BluishCoreTesting.runInject(Inject(() => Service))

    expect(value).toBeInstanceOf(Service)
  })
})

describe('.runSelector', () => {
  it('static action', async () => {
    const context = new Context()

    const value = await BluishCoreTesting.runSelector(
      Selector(() => 'test'),
      context,
    )

    expect(value).toBe('test')
  })
})
