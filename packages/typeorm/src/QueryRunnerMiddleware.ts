import { BeforeHandlerExecuteEvent, Middleware, HandlerExecuteFinishEvent } from '@bluish/core';
import { DataSource, ReplicationMode } from 'typeorm';
import { QueryRunner } from 'typeorm/browser';

import { QUERY_RUNNER } from './constants.js';

export class QueryRunnerMiddleware extends Middleware {
  constructor(
    protected dataSource: DataSource,
    protected mode?: ReplicationMode,
  ) {
    super();
  }

  public async onBefore(event: BeforeHandlerExecuteEvent): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner(this.mode);

    await queryRunner.connect();

    Object.defineProperty(event.context, QUERY_RUNNER, {
      value: queryRunner,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  public async onFinish(event: HandlerExecuteFinishEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER]) return;

    await event.context[QUERY_RUNNER].release();
  }
}

declare global {
  namespace Bluish {
    interface Context {
      readonly [QUERY_RUNNER]: QueryRunner;
    }
  }
}
