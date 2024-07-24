import { expect, it, vi } from 'vitest'

import CoreTesting from '../../core-testing.js'
import { Action, Context, Controller, Argument } from '../../core.js'

it('run static action', async () => {
  @Controller
  class Test {
    @Action(Context)
    public static act() {}
  }

  vi.spyOn(Test, 'act')

  await CoreTesting.run(Test, 'act', new Context())

  expect(Test.act).toHaveBeenCalled()
})

it('run static action with selector', async () => {
  @Controller
  class Test {
    @Action(Context)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static act(@Argument(() => '12345') value: string) {}
  }

  vi.spyOn(Test, 'act')

  await CoreTesting.run(Test, 'act', new Context())

  expect(Test.act).toHaveBeenCalledWith('12345')
})
