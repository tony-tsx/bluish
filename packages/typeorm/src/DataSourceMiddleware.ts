import { Middleware } from '@bluish/core';
import { DataSource } from 'typeorm';

export class DataSourceMiddleware extends Middleware {
  constructor(protected dataSource: DataSource) {
    super();
  }

  public async onInitialize(): Promise<void> {
    await this.dataSource.initialize();
  }
}
