import { Application } from '@bluish/core'
import { expect, it } from 'vitest'
import { GET } from '../../decorators/Route.js'
import { toPath, toVersion } from '../toPath.js'
import { Version } from '../../decorators/Version.js'
import { Controller } from '../../decorators/Controller.js'

it('factory path using controller inherit', async () => {
  @Controller('/root')
  class TestRoot {}

  @Controller('/test', { inherit: () => TestRoot })
  class Test {
    @GET
    public static action() {}
  }

  const application = await new Application()
    .register(TestRoot)
    .register(Test)
    .initialize()

  const action = application.controllers[1].actions[0]

  expect(toPath(action)).toBe('/root/test')
})

it('factory path using controller inherit', async () => {
  @Controller('/root1')
  class TestRoot1 {}

  @Controller('/root2', { inherit: () => TestRoot1 })
  class TestRoot2 {}

  @Controller('/test', { inherit: () => TestRoot2 })
  class Test {
    @GET
    public static action() {}
  }

  const application = await new Application()
    .register(TestRoot1)
    .register(TestRoot2)
    .register(Test)
    .initialize()

  const action = application.controllers[2].actions[0]

  expect(toPath(action)).toBe('/root1/root2/test')
})

it('get version from inherit controller', async () => {
  @Controller
  @Version(1)
  class V1 {}

  @Controller('/test', { inherit: () => V1 })
  class Test {
    @GET
    public static action() {}
  }

  const application = await new Application()
    .register(V1)
    .register(Test)
    .initialize()

  const action = application.controllers[1].actions[0]
  const version = toVersion(action)

  expect(version).toBe(1)
})
