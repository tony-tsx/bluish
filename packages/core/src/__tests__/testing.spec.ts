import { describe, expect, it, vi } from 'vitest'
import CoreTesting from '../core-testing.js'
import { Action, Context, Controller, Argument } from '../core.js'

describe('.run', () => {
  it('static action', async () => {
    @Controller
    class Test {
      @Action(Context)
      public static act() {}
    }

    vi.spyOn(Test, 'act')

    await CoreTesting.run(Test, 'act', new Context())

    expect(Test.act).toHaveBeenCalled()
  })

  it('action', async () => {
    const act = vi.fn()
    @Controller
    class Test {
      @Action(Context)
      public act(...args: unknown[]) {
        return act(...args)
      }
    }

    await CoreTesting.run(Test.prototype, 'act', new Context())

    expect(act).toHaveBeenCalled()
  })
})

describe('.runSelector', () => {
  it('static action', async () => {
    const context = new Context()

    context.value = 'test'

    const value = await CoreTesting.runSelector(
      Argument(context => context.value),
      context,
    )

    expect(value).toBe('test')
  })
})
