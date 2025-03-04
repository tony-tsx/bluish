/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Action,
  Application,
  Context,
  Controller,
  Inject,
  Input,
} from '@bluish/core'
import { IsEmail, IsGuard, IsString, ValidationError } from 'ornate-guard'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import guard from './ornate-guard.js'
import BluishCoreTesting from '@bluish/core/testing'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds schema validation', async () => {
  @IsGuard
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
      @Input(context => context.user) @Inject(() => User) user: User,
    ) {}
  }

  vi.spyOn(Test, 'act')

  await BluishCoreTesting.run(
    new Application().use(guard()),
    Test,
    'act',
    Object.assign(new Context(), {
      user: {
        name: 'John Doe',
        email: 'john.doe@test.dev',
      },
    }),
  )

  expect(Test.act).toHaveBeenCalledWith(expect.any(User))
})

it('throw validation error', async () => {
  @IsGuard
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
      @Inject(() => User) @Input(context => context.user) user: User,
    ) {}
  }

  vi.spyOn(Test, 'act')

  await expect(
    BluishCoreTesting.run(
      new Application().use(guard()),
      Test,
      'act',
      Object.assign(new Context(), {
        user: {
          name: 'John Doe',
        },
      }),
    ),
  ).rejects.toThrow(ValidationError)

  expect(Test.act).not.toHaveBeenCalledWith(expect.any(User))
})

it('catch validation error', async () => {
  @IsGuard
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
      @Input(context => context.user)
      @Inject(() => User)
      user: User,
    ) {}
  }

  vi.spyOn(Test, 'act')

  const handleValidationError = vi.fn(() => {})

  await BluishCoreTesting.run(
    new Application().use(
      guard({
        catch: [[Context, handleValidationError]],
      }),
    ),
    Test,
    'act',
    Object.assign(new Context(), {
      user: {
        name: 'John Doe',
      },
    }),
  )

  expect(Test.act).not.toHaveBeenCalled()
  expect(handleValidationError).toHaveBeenCalledWith(
    expect.any(ValidationError),
    expect.any(Context),
  )
})

it('skip non-guard injection', async () => {
  class User {
    public name!: string
    public email!: string
  }

  @Controller
  class Test {
    @Action(Context)
    public static act(
      @Input(context => context.user) @Inject(() => User) user: User,
    ) {}
  }

  vi.spyOn(Test, 'act')

  await BluishCoreTesting.run(
    new Application().use(guard()),
    Test,
    'act',
    Object.assign(new Context(), {
      user: {
        name: 'John Doe',
        email: 'john.doe@test.dev',
      },
    }),
  )

  expect(Test.act).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john.doe@test.dev',
  })
})

it('skip non-validation error onCatch', async () => {
  @IsGuard
  class User {
    @IsString()
    public name!: string
  }

  @Controller
  class Test {
    @Action(Context)
    public static act(
      @Input(context => context.user)
      @Inject(() => User)
      user: User,
    ) {
      throw new Error()
    }
  }

  vi.spyOn(Test, 'act')

  const handleValidationError = vi.fn(() => {})

  await expect(
    BluishCoreTesting.run(
      new Application().use(
        guard({
          catch: [[Context, handleValidationError]],
        }),
      ),
      Test,
      'act',
      Object.assign(new Context(), {
        user: {
          name: 'John Doe',
        },
      }),
    ),
  ).rejects.toThrow(Error)

  expect(handleValidationError).not.toHaveBeenCalled()
})

describe('reflect-metadata', async () => {
  await import('reflect-metadata')

  it('catch validation error', async () => {
    @IsGuard
    class User {
      @IsString()
      public name!: string

      @IsEmail()
      public email!: string
    }

    @Controller
    class Test {
      @Action(Context)
      public static act(@Input(context => context.user) user: User) {}
    }

    vi.spyOn(Test, 'act')

    const handleValidationError = vi.fn(() => {})

    await BluishCoreTesting.run(
      new Application().use(
        guard({
          catch: [[Context, handleValidationError]],
        }),
      ),
      Test,
      'act',
      Object.assign(new Context(), {
        user: {
          name: 'John Doe',
        },
      }),
    )

    expect(Test.act).not.toHaveBeenCalled()
    expect(handleValidationError).toHaveBeenCalledWith(
      expect.any(ValidationError),
      expect.any(Context),
    )
  })
})
