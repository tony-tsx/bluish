import { DELETE, GET, DefineParam, PATCH, Controller, PUT, UseQuery, UseBody, UseParam } from '@bluish/http';
import createHttpError from 'http-errors';
import { Transaction, UseTransaction } from '@bluish/typeorm';
import { ServiceBus } from '@bluish/azure-function-app/service-bus';

import { dataSource } from '../services/dataSource.js';
import { User } from '../entities/User.js';
import { UserFindQuery } from '../schemas/UserFindQuery.js';
import { UserSaveBody } from '../schemas/UserSaveBody.js';
import { UserPartialBody } from '../schemas/UserPartialBody.js';

@Controller('/users')
@DefineParam('user', id =>
  dataSource
    .getRepository(User)
    .findOneOrFail({ where: { id } })
    .catch(cause => {
      throw createHttpError(404, `Not Found User With ID '${id}'`, { cause });
    }),
)
export class UserController {
  public get repository() {
    return dataSource.getRepository(User);
  }

  public async massiveCreateUser(@ServiceBus.Queue('tests') queueItem: any) {
    console.log({ queueItem });
  }

  @GET
  public async find(@UseQuery query: UserFindQuery) {
    const [users, count] = await this.repository.findAndCount({
      take: query.take,
      skip: query.skip,
    });

    return { isEnd: query.isEnd(count), count, users };
  }

  @PUT
  public async save(@UseBody body: UserSaveBody, @UseTransaction(dataSource) transaction: Transaction) {
    return await transaction.save(transaction.create(User, body));
  }

  @GET('/{user}')
  public findOne(@UseParam('user') user: User) {
    return user;
  }

  @PATCH('/{user}')
  public async update(
    @UseParam('user') user: User,
    @UseBody body: UserPartialBody,
    @UseTransaction(dataSource) transaction: Transaction,
  ) {
    return await transaction.save(transaction.merge(User, user, body));
  }

  @DELETE('/{user}')
  public remove(@UseParam('user') user: User, @UseTransaction(dataSource) transaction: Transaction) {
    return transaction.softRemove(user);
  }
}
