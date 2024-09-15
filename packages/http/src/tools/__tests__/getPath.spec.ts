import { Application } from '@bluish/core'
import { it, expect } from 'vitest'
import { HttpSource } from '../../decorators/HttpSource.js'
import { GET } from '../../decorators/Route.js'
import { getPath } from '../getPath.js'

it('factory path using controller inherit', async () => {
  @HttpSource('/root')
  class TestRoot {}

  @HttpSource('/test')
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
  @HttpSource('/root1')
  class TestRoot1 {}

  @HttpSource('/root2')
  class TestRoot2 extends TestRoot1 {}

  @HttpSource('/test')
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
