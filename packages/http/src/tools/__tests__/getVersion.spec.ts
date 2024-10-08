import { expect, it } from 'vitest'
import { Version } from '../../decorators/Version.js'
import { HttpController } from '../../decorators/HttpController.js'
import { GET } from '../../decorators/Route.js'
import { Application } from '@bluish/core'
import { getVersion } from '../getVersion.js'

it('get version from action', async () => {
  @HttpController('/root')
  class Root {
    @GET
    @Version(1)
    public static action() {}
  }

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const action = application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!

  const version = getVersion(action)

  expect(version).toEqual([1])
})

it('get version from controller', async () => {
  @HttpController('/root')
  @Version(1)
  class Root {
    @GET
    public static action() {}
  }

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const action = application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!

  const version = getVersion(action)

  expect(version).toEqual([1])
})

it('get version from inherit controller', async () => {
  @Version(1)
  class V1 {}

  @HttpController('/root')
  class Root extends V1 {
    @GET
    public static action() {}
  }

  const application = await new Application({
    controllers: [Root],
  }).bootstrap()

  const action = application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('action')!

  const version = getVersion(action)

  expect(version).toEqual([1])
})
