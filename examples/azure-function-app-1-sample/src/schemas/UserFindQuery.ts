import { IsInteger } from 'omac';

export default class UserFindQuery {
  @IsInteger({ positive: true })
  public page: number = 1;

  @IsInteger({ positive: true, max: 50 })
  public limit: number = 25;
}
