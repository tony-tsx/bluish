import { expect, it, vi } from 'vitest'
import { Controller } from '../Controller.js'
import { Next } from '../Next.js'
import { Action } from '../Action.js'
import { Application } from '../../models/Application.js'
import { Context } from '../../models/Context.js'

it('inject next', async () => {
  @Controller
  class Root {
    @Action
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static action(@Next next: Next) {}
  }

  vi.spyOn(Root, 'action')

  const app = await new Application().useController(Root).bootstrap()

  await app.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!
    .run(new Context())

  expect(Root.action).toHaveBeenCalledWith(expect.any(Function))
})
