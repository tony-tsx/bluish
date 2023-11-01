import {
  AfterHandlerExecuteEvent,
  BeforeHandlerExecuteEvent,
  HandlerExecuteErrorEvent,
  HandlerExecuteFinishEvent,
} from '@bluish/core';
import { DataSource } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel.js';

import { QueryRunnerMiddleware } from './QueryRunnerMiddleware.js';
import { QUERY_RUNNER } from './constants.js';

export class TransactionMiddleware extends QueryRunnerMiddleware {
  constructor(
    protected dataSource: DataSource,
    protected isolationLevel?: IsolationLevel,
  ) {
    super(dataSource, 'master');
  }

  public override async onBefore(event: BeforeHandlerExecuteEvent): Promise<void> {
    await super.onBefore(event);

    if (event.context[QUERY_RUNNER].isTransactionActive) throw new Error('Transaction is active in query runner');

    await event.context[QUERY_RUNNER].startTransaction(this.isolationLevel);
  }

  public async onAfter(event: AfterHandlerExecuteEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER].isTransactionActive) return;

    await event.context[QUERY_RUNNER].commitTransaction();
  }

  public async onError(event: HandlerExecuteErrorEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER].isTransactionActive) return;

    await event.context[QUERY_RUNNER].rollbackTransaction();
  }

  public async onFinish(event: HandlerExecuteFinishEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER].isTransactionActive) return;

    await event.context[QUERY_RUNNER].rollbackTransaction();
  }
}
