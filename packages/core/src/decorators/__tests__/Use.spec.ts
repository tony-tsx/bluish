import { describe, expect, it } from 'vitest';

import { Controller } from '../Controller.js';
import { Action } from '../Action.js';
import { Driver } from '../../models/Driver.js';
import { Context } from '../../models/Context.js';
import { Runner } from '../../models/Runner.js';
import { Application } from '../../models/Application.js';
import { Use } from '../Use.js';
import { Middleware } from '../../models/Middleware.js';

describe('Use', () => {
  it('should work', async () => {
    @Controller
    class Test {
      @Action('test')
      @Use(Middleware.onAction(() => {}))
      public action1() {}

      @Action('test')
      @Use(Middleware.onAction(() => {}))
      public action2() {}
    }

    class TestDriver extends Driver {
      public toContext(runner: Runner<'test'>, ...args: any[]): Context | Promise<Context> {
        return args[0];
      }

      public toReturn(payload: unknown) {
        return payload;
      }
    }

    const app = new Application({
      driver: new TestDriver(),
      controllers: [Test],
    });

    await app.bootstrap();

    expect(app.controllers).toHaveLength(1);
    expect(app.controllers[0].middlewares).toHaveLength(0);
    expect(app.controllers[0].actions).toHaveLength(2);
    expect(app.controllers[0].actions[0].middlewares).toHaveLength(1);
    expect(app.controllers[0].actions[1].middlewares).toHaveLength(1);
  });
});

declare global {
  namespace Bluish {
    interface ActionMetadataArgMapByType {
      test: {};
    }
  }
}
