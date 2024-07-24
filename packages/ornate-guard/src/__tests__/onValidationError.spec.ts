import {
  Controller,
  Action,
  Context,
  Selector,
  Application,
  toRunner,
} from '@bluish/core'
import { IsString, IsEmail, ValidationError } from 'ornate-guard'
import { expect, it, vi } from 'vitest'
import { IsSchema } from '../IsSchema.js'
import { pipe } from '../pipe.js'
import { onValidationError } from '../onValidationError.js'

it('catch validation error', async () => {
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
    public static act(@Selector(context => context.user) user: User) {
      expect(user).toBeInstanceOf(User)
    }
  }

  vi.spyOn(Test, 'act')

  const application = await new Application()
    .register(Test)
    .pipe(pipe)
    .use(
      onValidationError(error => {
        expect(error).toBeInstanceOf(ValidationError)
      }),
    )
    .initialize()

  const context = new Context()

  context.user = {
    name: 'John Doe',
  }

  await toRunner(application.controllers[0].actions[0]).run(context)

  expect(Test.act).not.toHaveBeenCalled()
})
