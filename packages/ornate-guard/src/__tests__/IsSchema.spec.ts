import {
  Controller,
  Action,
  Context,
  Argument,
  Application,
  toRunner,
} from '@bluish/core'
import { IsString, IsEmail } from 'ornate-guard'
import { it, expect, vi } from 'vitest'
import { pipe } from '../pipe.js'
import { IsSchema } from '../IsSchema.js'

it('automatic validate using reflect metadata', async () => {
  await import('reflect-metadata')

  @IsSchema
  class User {
    @IsString()
    public name!: string

    @IsEmail()
    public email!: string
  }

  @Controller
  class Test {
    @Action(Context)
    public static act(@Argument(context => context.user) user: User) {
      expect(user).toBeInstanceOf(User)
    }
  }

  vi.spyOn(Test, 'act')

  const application = await new Application()
    .register(Test)
    .pipe(pipe)
    .initialize()

  const context = new Context()

  context.user = {
    name: 'John Doe',
    email: 'john.doe@test.dev',
  }

  await toRunner(application.controllers[0].actions[0]).run(context)

  expect(Test.act).toHaveBeenCalledWith(expect.any(User))
})
