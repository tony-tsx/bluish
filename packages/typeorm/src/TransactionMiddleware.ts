import { ActionErrorEvent, ActionFinallyEvent, ActionInitializeEvent, ActionThenEvent } from '@bluish/core';
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

  public override async onInitialize(event: ActionInitializeEvent): Promise<void> {
    await super.onInitialize(event);

    if (event.context[QUERY_RUNNER].isTransactionActive) throw new Error('Transaction is active in query runner');

    await event.context[QUERY_RUNNER].startTransaction(this.isolationLevel);
  }

  public async onThen(event: ActionThenEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER].isTransactionActive) return;

    await event.context[QUERY_RUNNER].commitTransaction();
  }

  public async onCatch(event: ActionErrorEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER].isTransactionActive) return;

    await event.context[QUERY_RUNNER].rollbackTransaction();
  }

  public override async onFinally(event: ActionFinallyEvent): Promise<void> {
    if (!event.context[QUERY_RUNNER].isTransactionActive) return;

    await event.context[QUERY_RUNNER].rollbackTransaction();

    await super.onFinally(event);
  }
}
