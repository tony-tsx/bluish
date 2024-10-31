import { expect, it, vi } from 'vitest'
import { Controller } from '../Controller.js'
import { Action } from '../Action.js'
import { Catch } from '../Catch.js'
import { Context } from '../../models/Context.js'
import BluishCoreTesting from '../../core-testing.js'

it('catch middleware handle error', async () => {
  const handle = vi.fn((error: Error, context: Context) => {
    context.error = error
  })

  class ActionError extends Error {}

  @Controller
  class Root {
    @Action
    @Catch(handle)
    public static act() {
      throw new ActionError()
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act')).resolves.toEqual(
    expect.objectContaining({
      error: expect.any(ActionError),
    }),
  )
})

it('rewrite error', async () => {
  class ActionError extends Error {}

  class RewriteError extends Error {}

  @Controller
  class Root {
    @Action
    @Catch.Rewrite(ActionError, RewriteError)
    public static act() {
      throw new ActionError()
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act')).rejects.toThrow(RewriteError)
})

it('rewrite error with message', async () => {
  class ActionError extends Error {}

  class RewriteError extends Error {}

  @Controller
  class Root {
    @Action
    @Catch.Rewrite(ActionError, RewriteError, 'custom error text')
    public static act() {
      throw new ActionError('test')
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act')).rejects.toThrow(
    'custom error text',
  )
})

it('rewrite error with message factory', async () => {
  class ActionError extends Error {}

  class RewriteError extends Error {}

  @Controller
  class Root {
    @Action
    @Catch.Rewrite(ActionError, RewriteError, error => error.message)
    public static act() {
      throw new ActionError('test')
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act')).rejects.toThrow('test')
})

it('rewrite error with multiple errors', async () => {
  class ActionError1 extends Error {}
  class ActionError2 extends Error {}

  class RewriteError extends Error {}

  @Controller
  @Catch.Rewrite([ActionError1, ActionError2], RewriteError)
  class Root {
    @Action
    public static act1() {
      throw new ActionError1()
    }

    @Action
    public static act2() {
      throw new ActionError1()
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act1')).rejects.toThrow(
    RewriteError,
  )
  await expect(BluishCoreTesting.run(Root, 'act2')).rejects.toThrow(
    RewriteError,
  )
})

it('rewrite error with multiple errors and different messages', async () => {
  class ActionError1 extends Error {}
  class ActionError2 extends Error {}

  class RewriteError extends Error {}

  @Controller
  @Catch.Rewrite(
    [ActionError1, ActionError2],
    RewriteError,
    'custom error text',
  )
  class Root {
    @Action
    public static act1() {
      throw new ActionError1()
    }

    @Action
    public static act2() {
      throw new ActionError1()
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act1')).rejects.toThrow(
    'custom error text',
  )
  await expect(BluishCoreTesting.run(Root, 'act2')).rejects.toThrow(
    'custom error text',
  )
})

it('catch handle for especific context', async () => {
  const handle = vi.fn((error: Error, context: Context) => {
    context.error = error
  })

  class ActionError extends Error {}

  class CustomContext extends Context {
    public error?: Error
  }

  @Controller
  class Root {
    @Action
    @Catch(CustomContext, handle)
    public static act() {
      throw new ActionError()
    }
  }

  await expect(
    BluishCoreTesting.run(Root, 'act', new CustomContext()),
  ).resolves.toEqual(
    expect.objectContaining({
      error: expect.any(ActionError),
    }),
  )

  await expect(BluishCoreTesting.run(Root, 'act')).rejects.toThrow(ActionError)
})

it('does rewrite wrong error', async () => {
  class ActionError extends Error {}

  class RewriteError extends Error {}

  @Controller
  class Root {
    @Action
    @Catch.Rewrite(ActionError, RewriteError)
    public static act() {
      throw new Error()
    }
  }

  await expect(BluishCoreTesting.run(Root, 'act')).rejects.toThrow(Error)
})
