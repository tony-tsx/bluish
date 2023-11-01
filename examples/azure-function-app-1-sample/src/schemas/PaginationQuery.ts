import { IsSchema } from '@bluish/omac';
import { IsInteger } from 'omac';

@IsSchema()
export class PaginationQuery {
  @IsInteger({ coerce: true, positive: true })
  public page: number = 1;

  @IsInteger({ coerce: true, positive: true, max: 50 })
  public take: number = 25;

  public get offset() {
    return (this.page - 1) * this.take;
  }

  public get skip() {
    return this.offset;
  }

  public isEnd(count: number): boolean {
    return this.page * this.take >= count;
  }
}
