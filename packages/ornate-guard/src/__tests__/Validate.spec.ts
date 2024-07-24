import {
  Action,
  Application,
  Context,
  Controller,
  Selector,
  toRunner,
} from '@bluish/core'
import { IsEmail, IsString, ValidationError } from 'ornate-guard'
import { expect, it, vi } from 'vitest'
import { Validate } from '../Validate.js'
import { pipe } from '../pipe.js'

it('adds schema validation', async () => {
  class User {
    @IsString()
    public name!: string

    @IsEmail()
    public email!: string
  }

  @Controller
  class Test {
    @Action(Context)
    public static act(
      @Validate(() => User) @Selector(context => context.user) user: User,
    ) {
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

it('throw validation error', async () => {
  class User {
    @IsString()
    public name!: string

    @IsEmail()
    public email!: string
  }

  @Controller
  class Test {
    @Action(Context)
    public static act(
      @Validate(() => User) @Selector(context => context.user) user: User,
    ) {
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
  }

  await expect(
    toRunner(application.controllers[0].actions[0]).run(context),
  ).rejects.toThrow(ValidationError)

  expect(Test.act).not.toHaveBeenCalled()
})
