import { expect, it, vi } from 'vitest'
import { Pipe } from '../Pipe.js'
import { Action } from '../Action.js'
import {
  Application,
  Context,
  Controller,
  Selector,
  toRunner,
} from '../../core.js'

it('use pipe with reflect metadata', async () => {
  await import('reflect-metadata')

  @Pipe((value, argument) => argument.type(value))
  @Controller
  class Test {
    @Action(Context)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static number(@Selector(context => context.value) value: number) {}

    @Action(Context)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static string(@Selector(context => context.value) value: string) {}
  }

  vi.spyOn(Test, 'number')
  vi.spyOn(Test, 'string')

  const application = await new Application().register(Test).initialize()

  await toRunner(application.controllers[0].actions[0]).run(
    Object.assign(new Context(), { value: '1' }),
  )
  await toRunner(application.controllers[0].actions[1]).run(
    Object.assign(new Context(), { value: 1 }),
  )

  expect(Test.number).toHaveBeenCalledWith(1)
  expect(Test.string).toHaveBeenCalledWith('1')
})
