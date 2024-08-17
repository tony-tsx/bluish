import { beforeEach, expect, it, vi } from 'vitest'
import { Application } from '../Application.js'
import BluishCoreTesting from '../../core-testing.js'
import { Controller } from '../../decorators/Controller.js'
import { Context } from '../Context.js'
import { ApplicationControllerAction } from '../ApplicationControllerAction.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

vi.mock('glob')

it('isInitialized return false is not initialized', () => {
  const app = new Application()

  expect(app.isInitialized).toBe(false)
})

it('isInitialized return true is initialized', async () => {
  const app = await new Application().initialize()

  expect(app.isInitialized).toBe(true)
})

it('adds controller to application', async () => {
  @Controller
  class Test {}

  const app = await new Application().controller(Test).initialize()

  expect(app.controllers).toHaveLength(1)
})

it('adds multiple controllers to application', async () => {
  @Controller
  class Test {}

  @Controller
  class Test2 {}

  const app = await new Application()
    .controller(Test)
    .controller(Test2)
    .initialize()

  expect(app.controllers).toHaveLength(2)
})

it('dont adds non registered controller to application', async () => {
  class Test {}

  const app = await new Application().controller(Test).initialize()

  expect(app.controllers).toHaveLength(0)
})

it('adds middleware to application', async () => {
  const app = await new Application().use(() => {}).initialize()

  expect(app.middlewares).toHaveLength(1)
})

it('adds multiple middlewares to application', async () => {
  const app = await new Application()
    .use(() => {})
    .use(() => {})
    .initialize()

  expect(app.middlewares).toHaveLength(2)
})

it('adds middleware with specific context to application', async () => {
  class CustomContext extends Context {
    // Custom context implementation
  }

  const app = await new Application().use(CustomContext, () => {}).initialize()

  expect(app.middlewares).toHaveLength(1)
})

it('adds middleware with multiple contexts to application', async () => {
  class CustomContext1 extends Context {
    // Custom context implementation
  }

  class CustomContext2 extends Context {
    // Custom context implementation
  }

  const app = await new Application()
    .use(CustomContext1, () => {})
    .use(CustomContext2, () => {})
    .initialize()

  expect(app.middlewares).toHaveLength(2)
})

it('adds pipe to application', () => {
  const app = new Application().pipe(() => {})

  expect(app.pipes).toHaveLength(2)
})

it('adds multiple pipes to application', async () => {
  const app = await new Application()
    .pipe(() => {})
    .pipe(() => {})
    .initialize()

  expect(app.pipes).toHaveLength(3)
})

it('adds virtual action to application', async () => {
  const app = new Application()

  expect(app.action(() => {})).toBeInstanceOf(ApplicationControllerAction)

  await app.initialize()

  expect(app.controllers).toHaveLength(1)
})

it('adds virtual action with specific context to application', async () => {
  class CustomContext extends Context {
    // Custom context implementation
  }

  const app = new Application()

  expect(app.action(CustomContext, () => {})).toBeInstanceOf(
    ApplicationControllerAction,
  )

  await app.initialize()

  expect(app.controllers).toHaveLength(1)
})

it('adds controllers from glob path', async () => {
  const glob = await import('glob')

  vi.spyOn(glob, 'glob').mockResolvedValueOnce([`/home/controllers/test-1.js`])

  vi.mock('/home/controllers/test-1.js', () => {
    @Controller
    class Root {}

    return { Root }
  })

  const app = await new Application()
    .controller('/home/controllers/**/*.js')
    .initialize()

  expect(app.controllers).toHaveLength(1)
})

it('adds multiple controllers from glob path', async () => {
  const glob = await import('glob')

  vi.spyOn(glob, 'glob').mockResolvedValueOnce([
    '/home/controllers/test-2-1.js',
    '/home/controllers/test-2-2.js',
    '/home/controllers/test-2-3.js',
  ])

  vi.mock('/home/controllers/test-2-1.js', () => {
    @Controller
    class Controller1 {}

    return { Controller1 }
  })

  vi.mock('/home/controllers/test-2-2.js', () => {
    @Controller
    class Controller2 {}

    return { Controller2 }
  })

  vi.mock('/home/controllers/test-2-3.js', () => {
    @Controller
    class Controller3 {}

    return { Controller3 }
  })

  const app = await new Application()
    .controller('/home/controllers/**/*.js')
    .initialize()

  expect(app.controllers).toHaveLength(3)
})

it('adds middlewares directly in application configuration argument', async () => {
  const middleware1 = () => {}
  const middleware2 = () => {}

  const app = await new Application({
    middlewares: [middleware1, middleware2],
  }).initialize()

  expect(app.middlewares).toHaveLength(2)
})

it('adds controllers directly in application configuration argument', async () => {
  @Controller
  class Test1 {}

  @Controller
  class Test2 {}

  const app = await new Application({
    controllers: [Test1, Test2],
  }).initialize()

  expect(app.controllers).toHaveLength(2)
})

it('adds controllers with mixed types in application configuration argument', async () => {
  const glob = await import('glob')

  vi.spyOn(glob, 'glob').mockResolvedValueOnce([
    '/home/controllers/test-3-1.js',
  ])

  vi.mock('/home/controllers/test-3-1.js', () => {
    @Controller
    class Controller1 {}

    return { Controller1 }
  })

  @Controller
  class Test1 {}

  class Test2 {}

  const app = await new Application({
    controllers: [Test1, Test2, '/home/controllers/test-3-1.js'],
  }).initialize()

  expect(app.controllers).toHaveLength(2)
})

it('does not add controller decorated but not registered', async () => {
  @Controller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  class Test {}

  const app = await new Application().initialize()

  expect(app.controllers).toHaveLength(0)
})
