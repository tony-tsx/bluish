import { Application } from '@bluish/core'
import { it, expect } from 'vitest'
import { HttpController } from '../../decorators/HttpController.js'
import { GET } from '../../decorators/Route.js'
import { getPath } from '../getPath.js'

it('factory path using controller inherit', async () => {
  @HttpController('/root')
  class TestRoot {}

  @HttpController('/test')
  class Test extends TestRoot {
    @GET
    public static action() {}
  }

  const application = await new Application({
    controllers: [Test],
  }).bootstrap()

  const action = application.controllers
    .findByConstructable(Test)!
    .actions.findByStaticPropertyKey('action')!

  expect(getPath(action)).toBe('/root/test')
})

it('factory path using controller inherit', async () => {
  @HttpController('/root1')
  class TestRoot1 {}

  @HttpController('/root2')
  class TestRoot2 extends TestRoot1 {}

  @HttpController('/test')
  class Test extends TestRoot2 {
    @GET
    public static action() {}
  }

  const application = await new Application({
    controllers: [Test],
  }).bootstrap()

  const action = application.controllers
    .findByConstructable(Test)!
    .actions.findByStaticPropertyKey('action')!

  expect(getPath(action)).toBe('/root1/root2/test')
})
