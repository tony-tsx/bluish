import { expect, it } from 'vitest'
import { HttpController } from '../../decorators/HttpController.js'
import { POST } from '../../decorators/Route.js'
import { Application } from '@bluish/core'
import { getAccept } from '../getAccept.js'
import { ApplicationHttpSourceAcceptJson, Json } from '../../modules/json.js'

it('get accept', async () => {
  @HttpController('/root')
  class Root {
    @POST
    public static action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  const action = app.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!

  expect(getAccept(action)).toEqual([])
})

it('get accept (declare application/json)', async () => {
  @HttpController('/root')
  class Root {
    @POST
    @Json()
    public static action() {}
  }

  const app = await new Application().useController(Root).bootstrap()

  const action = app.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!

  expect(getAccept(action)).toEqual([
    expect.any(ApplicationHttpSourceAcceptJson),
  ])
})
