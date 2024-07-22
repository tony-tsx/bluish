import { expect, it, vi } from 'vitest'
import {
  Action,
  Application,
  Context,
  Controller,
  Middleware,
  toRunner,
  Use,
} from '../../core.js'

it('exec middleware in action', async () => {
  const middleware = Middleware.from(() => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    @Use(middleware)
    public action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in controller', async () => {
  const middleware = Middleware.from(() => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  @Use(middleware)
  class Test {
    @Action(Context)
    public action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in application', async () => {
  const middleware = Middleware.from(() => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    public action() {}
  }

  const app = await new Application()
    .use(middleware)
    .register(Test)
    .initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in static action', async () => {
  const middleware = Middleware.from(() => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    @Use(middleware)
    public static action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in controller with static action', async () => {
  const middleware = Middleware.from(() => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  @Use(middleware)
  class Test {
    @Action(Context)
    public static action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in application with static action', async () => {
  const middleware = Middleware.from(() => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    public static action() {}
  }

  const app = await new Application()
    .use(middleware)
    .register(Test)
    .initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in action with specific context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    @Use(middleware)
    public action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new TestContext())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in controller with specific context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  @Use(middleware)
  class Test {
    @Action(Context)
    public action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new TestContext())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in application with specific context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    public action() {}
  }

  const app = await new Application()
    .use(middleware)
    .register(Test)
    .initialize()

  await toRunner(app.controllers[0].actions[0]).run(new TestContext())

  expect(middleware.handle).toHaveBeenCalled()
})

it('exec middleware in static action with specific context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    @Use(middleware)
    public static action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new TestContext())

  expect(middleware.handle).toHaveBeenCalled()
})

it('dont exec middleware in action with differente context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    @Use(middleware)
    public action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).not.toHaveBeenCalled()
})

it('dont exec middleware in controller with differente context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  @Use(middleware)
  class Test {
    @Action(Context)
    public action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).not.toHaveBeenCalled()
})

it('dont exec middleware in application with different context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    public action() {}
  }

  const app = await new Application()
    .use(middleware)
    .register(Test)
    .initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).not.toHaveBeenCalled()
})

it('dont exec middleware in static action with different context', async () => {
  class TestContext extends Context {}

  const middleware = Middleware.from(TestContext, () => {})

  vi.spyOn(middleware, 'handle')

  @Controller
  class Test {
    @Action(Context)
    @Use(middleware)
    public static action() {}
  }

  const app = await new Application().register(Test).initialize()

  await toRunner(app.controllers[0].actions[0]).run(new Context())

  expect(middleware.handle).not.toHaveBeenCalled()
})
